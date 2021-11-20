const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORORAGE_KEY = 'MUSIC_PLAYER';

//web audio/video DOM reference 
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app ={
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORORAGE_KEY)) || {},
    songs: [
    {
        name: 'Unstoppable',
        singer: 'Sia',
        path: './music/Unstoppable-Sia-4312901.mp3',
        image: './img/unstoppable.jpg'
    },
    {
        name: 'Dancing With Your Ghost',
        singer: 'SashaSloan',
        path: './music/DancingWithYourGhost-SashaSloan-6153043.mp3',
        image: './img/dancing.jpg'
    },
    {
       name: 'On My Way',
       singer: 'AlanWalker',
       path: './music/OnMyWay-AlanWalkerSabrinaCarpenterFarruko-5919403.mp3',
       image: './img/on-my-way.jpg'
   },
   
   {
       name: 'Way Back',
       singer: 'Vicetone',
       path: './music/WayBack-VicetoneCoziZuehlsdorff-5411153.mp3',
       image: './img/way-back.jpg'
   }
    ],
     
    setConfig: function(key,value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORORAGE_KEY, JSON.stringify(this.config))
    },
    render: function(){
        const htmls = this.songs.map((song, index) =>{
            return`
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = ${index}>
                <div class="thumb" 
                style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join("");
    },

    handleEvent: function(){
        const cdWidth = cd.offsetWidth;

        //xử lý cd quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000, //10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause();
        //xử lý phóng to/ thu nhỏ cd
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth>0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth/cdWidth;
        }

        //xử lí khi click play
        playBtn.onclick = function(){
            if (app.isPlaying){
                audio.pause();
            }
            else{
                audio.play();
            }
            
        }
        //khi bài hát đc play
        audio.onplay = function(){
            app.isPlaying = true
            player.classList.add("playing")
            cdThumbAnimate.play()
        }
        //khi bài hát pause 
        audio.onpause = function(){
            app.isPlaying = false
            player.classList.remove("playing")
            cdThumbAnimate.pause()
        }

        //khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if (audio.duration){
                const progressPercent = Math.floor(audio.currentTime/audio.duration * 100)
                progress.value = progressPercent;
            }
        }

        //xử lí tua
        progress.onchange = function(e){
            const seekTime = audio.duration /100 * e.target.value
            audio.currentTime = seekTime;
        }

        //khi next song
        nextBtn.onclick = function(){
            if (app.isRandom){
                app.randomSong();
            }
            else{
                app.nextSong();
            }
            audio.play();
            app.render();
            app.scrollToActiveSong();
        }
        //khi prev song
        prevBtn.onclick = function(){
            if (app.isRandom){
                app.randomSong();
            }
            else{
                app.prevSong();
            }
            audio.play();
            app.render();
        }

        
        //xử lý next song khi audio ended
        audio.onended = function(){
            if (app.isRepeat){
                audio.play();
            }
            else{
                nextBtn.click();
                
            }
        }
        //xử lý random
        randomBtn.onclick = function(){
            app.isRandom = !app.isRandom;
            app.setConfig('isRandom', app.isRandom);
            randomBtn.classList.toggle('active', app.isRandom);
        }

        //xử lý repeat 
        repeatBtn.onclick = function(){
            app.isRepeat = !app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle('active', app.isRepeat);
        }

        //lắng nghe hành vi click vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')){
                if (songNode){
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong()
                    app.render();
                    audio.play();
                }
            }
        }

    },
    scrollToActiveSong: function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: 'nearest',

            })
        },200)
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;

    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },
    loadCurrentSong: function(){

        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path;
    },
    nextSong: function(){
        this.currentIndex++
        if (this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex--
        if (this.currentIndex <0){
            this.currentIndex = this.songs.length-1;
        }
        this.loadCurrentSong()
    },
    randomSong: function(){
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * this.songs.length )
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function(){

        //gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        //định nghĩa các thuộc tính cho object
        this.defineProperties();

        //lắng nghe / xử lý các sự kiện
        this.handleEvent();

        //tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        //render playlist
        this.render()

        //hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    }
};
 
app.start();