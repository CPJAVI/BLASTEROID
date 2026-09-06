// sound.js
class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicPlaying = false;
        this.soundEnabled = true;
    }

    loadSound(name, url) {
        return new Promise((resolve) => {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.oncanplaythrough = () => {
                this.sounds[name] = audio;
                resolve();
            };
            audio.onerror = () => {
                this.sounds[name] = new Audio();
                resolve();
            };
            audio.load();
        });
    }

    loadMusic(url) {
        return new Promise((resolve) => {
            this.music = new Audio(url);
            this.music.loop = true;
            this.music.volume = 0.3;
            this.music.preload = 'auto';
            this.music.oncanplaythrough = () => {
                resolve();
            };
            this.music.onerror = () => {
                this.music = null;
                resolve();
            };
            this.music.load();
        });
    }

    play(name) {
        if (!this.soundEnabled) return;
        if (this.sounds[name]) {
            try {
                const clone = this.sounds[name].cloneNode();
                clone.volume = 0.5;
                clone.play().catch(() => {});
            } catch(e) {}
        }
    }

    playMusic() {
        if (!this.soundEnabled || !this.music) return;
        if (!this.musicPlaying) {
            this.music.play().catch(() => {});
            this.musicPlaying = true;
        }
    }

    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
            this.musicPlaying = false;
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (!this.soundEnabled && this.music) {
            this.music.pause();
            this.musicPlaying = false;
        } else if (this.soundEnabled && this.music) {
            this.music.play().catch(() => {});
            this.musicPlaying = true;
        }
    }
}