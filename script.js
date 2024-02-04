console.log("Lets write it..")

let currentsong = new Audio()

let allsongs;

let currFolder;

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

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    allsongs = []

    for (let index = 0; index < as.length; index++) {

        const elements = as[index]
        if (elements.href.endsWith(".mp3")) {
            allsongs.push(elements.href.split(`/${folder}/`)[1]);
        }
    }

    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of allsongs) {
        songUl.innerHTML = songUl.innerHTML + `
        <li>
        <img class="inverted" src="Images/music.svg" alt="">
        <div class="info">
            <div> ${song.replaceAll("%20", " ")}</div>
            <div>Song artist</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="inverted" src="Images/play.svg" alt="">
        </div>
    </li>`
    }


    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {

        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return allsongs
}

const playMusic = (track,pause=false) => {

    currentsong.src = `/${currFolder}/` + track


    if(!pause){
        currentsong.play()  
        playss.src = "Images/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

//display dynamic albums

async function displayAlbums(){
    let a = await fetch(`/Songs/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a")

    let cardContainer = document.querySelector(".cardContainer")
    // console.log(anchors)
    let arra = Array.from(anchors)
    for(let ele=0;ele<arra.length;ele++){

        if(arra[ele].href.includes("/Songs")){
            // console.log(anchors[ele].href.split("/")[4])
            let folder = arra[ele].href.split("/")[4]

            let a = await fetch(`/Songs/${folder}/info.json`)
            let response = await a.json()
            // console.log(response)
            

            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div data-folder="${folder}" class="card">
                        <div class="playButton">
                            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24"
                                fill="none">
                                <circle cx="12" cy="12" r="12" fill="#1fdf64" />

                                <svg x="5.5" y="4" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 20V4L19 12L5 20Z" fill="black" stroke="#000000" stroke-width="1.5"
                                        stroke-linejoin="round" />
                                </svg>
                            </svg>
                        </div>
                        <img src="/Songs/${folder}/Cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div> `
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item =>{
            allsongs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`)
            // console.log(allsongs)
            playMusic(allsongs[0])
        })
    })

    // playMusic(currFolder[0],true)
}

async function main() {
    await getSongs("Songs/Playlist1")
    // console.log(allsongs)
    playMusic(allsongs[0],true)

    //display albums
    displayAlbums()

    playss.addEventListener("click", ()=>{

        if (currentsong.paused) {
            currentsong.play()
            playss.src = "Images/pause.svg"
        }
        else {
            currentsong.pause();
            playss.src = "Images/play.svg"
        }
    })

    //timeupdate
    currentsong.addEventListener("timeupdate",()=>{
        // console.log(currentsong.currentTime,currentsong.duration)

        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime/currentsong.duration)*100 + "%"
    })

    //seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) *100
        document.querySelector(".circle").style.left = percent + "%"

        currentsong.currentTime = ((currentsong.duration)*percent)/100
    })

    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0%";
        document.querySelector(".right").style.opacity = "0.2";
        document.querySelector(".left").style.transition = "all 1s";
    })
    
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-100%";
        document.querySelector(".right").style.opacity = "1";
        document.querySelector(".left").style.transition = "all 2s";
    })

    previous.addEventListener("click",()=>{
        // playMusic(currentsong.src.split("/").slice(-1)[0])
        let index = allsongs.indexOf(currentsong.src.split("/").slice(-1)[0])

        if(index==0){
            playMusic(allsongs[allsongs.length-1])
        }
        else{
            playMusic(allsongs[index-1])

        }
    })
    next.addEventListener("click",()=>{

        currentsong.pause()
        // playMusic(currentsong.src.split("/").slice(-1)[0])
        let index = allsongs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if(index == allsongs.length-1){
            playMusic(allsongs[0]);
        }
        else{

            playMusic(allsongs[index+1])
        }
    })

    //Adding volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentsong.volume = parseInt(e.target.value) / 100
    })

    //adding mute
    document.querySelector(".vol>img").addEventListener("click",e=>{

        // console.log(e.target)
        console.log(e.target.src)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume = 0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })
    
}

main()