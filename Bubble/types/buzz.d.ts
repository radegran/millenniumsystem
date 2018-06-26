interface Sound {
    load(): void;
    play(): void;
    pause(): void;
    togglePlay(): void;
    isPaused(): void;
    stop(): void;
    isEnded(): boolean;
    loop(): void;
    unloop(): void;

    mute(): void;
    unmute(): void;
    toggleMute(): void;
    isMuted(); bool;
    setVolume(volume: number): void;
    getVolume(): number;
    increaseVolume(volume?: number): void;
    decreaseVolume(volume?: number): void;
    fadeIn(duration?: number, callback?: Function): void;
    fadeOut(duration?: number, callback?: Function): void;
    fadeTo(volume: number, duration?: number, callback?: Function): void;
    fadeWith(sound: Sound, duration?: number): void;

    bind(event: string, callback: Function): void;
    bindOnce(event: string, callback: Function): void;
    unbind(event: string): void;
    trigger(event: string): void;

    setTime(seconds: number): void;
    getTime(): number;
    setPercent(percent: number): void;
    getPercent(): number;
    getDuration(): number;
    SetSpeed(speed: number): void;
    GetSpeed(): number;

    getPlayed(): Array<Sound>;
    getBuffered(): Array<Sound>;
    getSeekable(): Array<Sound>;

    getErrorCode(): string;
    getErrorMessage(): string;
    getStateCode(): string;
    getStateMessage(): string;
    getNetworkStateCode(): string;
    getNetworkStateMessage(): string;
}

interface Group {
    load(): void;
    play(): void;
    pause(): void;
    togglePlay(): void;
    stop(): void;
    loop(): void;
    unloop(): void;

    mute(): void;
    unmute(): void;
    toggleMute(): void;
    isMuted(); bool;
    setVolume(volume: number): void;
    increaseVolume(volume?: number): void;
    decreaseVolume(volume?: number): void;
    fadeIn(duration?: number, callback?: Function): void;
    fadeOut(duration?: number, callback?: Function): void;
    fadeTo(volume: number, duration?: number, callback?: Function): void;

    bind(event: string, callback: Function): void;
    bindOnce(event: string, callback: Function): void;
    unbind(event: string): void;
    trigger(event: string): void;

    setTime(seconds: number): void;
    setPercent(percent: number): void;
    SetSpeed(speed: number): void;
}

declare var buzz: {

    isSupported(): boolean;
    isOGGSupported(): boolean;
    isWAVSupported(): boolean;
    isMP3Supported(): boolean;
    isAACSupported(): boolean;

    toTimer(seconds: number, long: boolean): string;
    fromTimer(timer: string): number;
    toPercent(value: number, total: number, round: boolean): number;
    fromPercent(value: number, total: number, round: boolean): number;

    sounds: Array<Sound>;

    defaults: {
        preload: string;
        autoplay: boolean;
        loop: boolean;
        placeholder: string;
        duration: number;
        //formats: Array;
    };

    group: {
        new (sounds: string[]): Sound;
    };

    sound: {
        all(): Group;
        new (sources: string, settings?: any): Sound;
        new (sources: string[], settings?: any): Sound;
    };
}

/*
export var buzzEvents = {
    about: "",
    canplay: "",
    canplaythrough: "",
    dataunavailable: "",
    durationchange: "",
    emptied: "",
    empty: "",
    ended: "",
    error: "",
    loadeddata: "",
    loadedmetadata: "",
    loadstart: "",
    pause: "",
    play: "",
    playing: "",
    progress: "",
    ratechange: "",
    seeked: "",
    seeking: "",
    suspend: "",
    timeupdate: "",
    volumechange: "",
    waiting: "",
}
*/