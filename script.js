let currentSong = new Audio();
let songs;
let currFolder;


// line:88  convert seconds to minutes seconds
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder){
currFolder = folder
//fetching api of songs

    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }


    // Show all the songs in the playlists

let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
songUL.innerHTML = ""
for (const song of songs) {    //removes the unecessary %20,26,etc
    songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                    <div class="info">
                        <div> ${song.replaceAll("%20", " ")}</div>
                        <div>Song artist</div>
                    </div>
                    <div class="playnow flex justify align">
                        <span>Play Now</span>
                        <img  class="invert playbtn" src="img/play.svg" alt="">
                    </div></li>`;
    }
    
    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}

// playing the songs in website
const playMusic = (track, pause = false)=>{  
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"
    }
    document.querySelector(".song_info").innerHTML = decodeURI(track)
    document.querySelector(".song_time").innerHTML = "00:00 / 00:00"
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/Spotify/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/Spotify/songs/")&& !e.href.includes(".htaccess")){
        let folder = e.href.split("/").slice(-1)[0]
        
            // get the metadata of the folder
            
            let a = await fetch(`http://127.0.0.1:3000/Spotify/songs/${folder}/info.json`)
    let response = await a.json();
    
    cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card ">
                        <div class="play">
                            <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green Circle Background -->
                                <circle cx="50" cy="50" r="40" fill="#00C853"/>
                                
                                <!-- Black Play Icon -->
                                <polygon points="40,30 40,70 70,50" fill="black"/>
                            </svg>
                        </div>
                        <img src="/Spotify/songs/${folder}/cover.jpg"  alt="">
                        <h2>${response.title}</h2>
                        <p>${response.discription}</p>
                    </div>`
        }
    }
    // Load the playlists whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) =>{
            
            songs = await getSongs(`spotify/songs/${item.currentTarget.dataset.folder }`)
            
            //whenever  the card is clicked the first song plays
            playMusic(songs[0])
        })
    });
}
async function main() {
    
    // Get the lists of all the songs
await getSongs("spotify/songs/ncs")
playMusic(songs[0], true)  // when reload the website the song 0 will be displayed
    
// Displlay all the albums
    await displayAlbums()

    // Attach an event listener to play , next and previous
    
    play.addEventListener("click", element => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause();
             play.src = "img/play.svg"
        }
    })

    // Listen for time update event
    currentSong.addEventListener("timeupdate", element => {
        document.querySelector(".song_time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

        // the seek will move from left acc to song duration 
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"    //since we are converting into % so, multiply by 100
    })

    // add an event listener to seekbar
    // so that we can play the song from any time or duration

    document.querySelector(".seekbar").addEventListener("click", e =>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left =  percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener to the hamburger

    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener to close the hamburger menu

    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    
    // Add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting the volume to ", e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume>0) {
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("mute.svg" ,"volume.svg")
        }
    })

    // Add eventlistner to mute the track
    document.querySelector(".volume > img").addEventListener("click" , e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src =  e.target.src.replace("volume.svg" ,"mute.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            currentSong.volume = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg" ,"volume.svg")
            currentSong.volume = .10;
        }

    })
   
    
    
    
}
main()
