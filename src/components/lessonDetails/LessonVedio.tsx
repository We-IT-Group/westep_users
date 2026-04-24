import {
    MediaPlayer, MediaPlayerInstance, MediaProvider, Poster
} from '@vidstack/react';
import {DefaultVideoLayout} from '@vidstack/react/player/layouts/default';
import {
    FullScreen,
    Mute,
    Play,
    RotateLeft,
    RotateRight,
    Setting,
    VolumeHigh,
    VolumeLow,
    Pause, ExitFullScreen, Replay
} from "../../assets/icon";
import {SeekButton} from "@vidstack/react";

import type {DefaultLayoutIcons} from '@vidstack/react/player/layouts/default';
import {useCallback, useEffect, useRef} from "react";
import {useUpdateLessonProgress} from "../../api/lessonProgress/useLessonProgress.ts";
import {useParams} from "react-router-dom";

const None = () => null;
const PROGRESS_INTERVAL_MS = 10000;

const customIcons: Partial<DefaultLayoutIcons> = {
    AirPlayButton: {
        Default: () => <Play width={28} height={28}/>,
        Connecting: None,
        Connected: None,
    },
    GoogleCastButton: {
        Default: None,
        Connecting: None,
        Connected: None,
    },
    PlayButton: {
        Play: () => <Play width={28} height={28}/>,
        Pause: () => <Pause width={28} height={28}/>,
        Replay: () => <Replay width={28} height={28}/>,
    },
    MuteButton: {
        Mute: () => <Mute width={28} height={28}/>,
        VolumeLow: () => <VolumeLow width={28} height={28}/>,
        VolumeHigh: () => <VolumeHigh width={28} height={28}/>,
    },
    CaptionButton: {
        On: None,
        Off: None,
    },
    PIPButton: {
        Enter: None,
        Exit: None,
    },
    FullscreenButton: {
        Enter: () => <FullScreen width={28} height={28}/>,
        Exit: () => <ExitFullScreen width={28} height={28}/>,
    },
    SeekButton: {
        Backward: () => <RotateLeft width={28} height={28}/>,
        Forward: () => <RotateRight width={28} height={28}/>,
    },
    DownloadButton: {
        Default: None,
    },
    Menu: {
        Accessibility: None,
        ArrowLeft: None,
        ArrowRight: None,
        Audio: None,
        AudioBoostUp: None,
        AudioBoostDown: None,
        Chapters: None,
        Captions: None,
        Playback: None,
        Settings: () => <Setting width={28} height={28}/>,
        SpeedUp: () => <RotateLeft width={28} height={28}/>,
        SpeedDown: () => <RotateRight width={28} height={28}/>,
        QualityUp: None,
        QualityDown: None,
        FontSizeUp: None,
        FontSizeDown: None,
        OpacityUp: None,
        OpacityDown: None,
        RadioCheck: None,
    },
    KeyboardDisplay: {
        Play: None,
        Pause: None,
        Mute: None,
        VolumeUp: None,
        VolumeDown: None,
        EnterFullscreen: None,
        ExitFullscreen: None,
        EnterPiP: None,
        ExitPiP: None,
        CaptionsOn: None,
        CaptionsOff: None,
        SeekForward: () => <RotateRight width={32} height={32}/>,
        SeekBackward: () => <RotateLeft width={32} height={32}/>,
    },
};


const VideoPlayer = ({videoUrl, setEnded, startTime, onProgressChange}: {
    videoUrl: string,
    setEnded: (end: boolean) => void,
    startTime: number
    onProgressChange?: (progress: { currentSecond?: number; completed?: boolean } | null) => void
}) => {
    const { mutateAsync } = useUpdateLessonProgress();
    const params = useParams();
    const splatSegments = (params["*"] || "").split("/").filter(Boolean);
    const currentLessonId = splatSegments[1];

    const playerRef = useRef<MediaPlayerInstance>(null);
    const segmentStartSecondRef = useRef<number | null>(null);
    const lastObservedSecondRef = useRef<number | null>(null);
    const lastSavedSecondRef = useRef<number | null>(null);
    const restoreTimeoutsRef = useRef<number[]>([]);
    const progressTimerRef = useRef<number | null>(null);
    const lastRestoredStartTimeRef = useRef<number | null>(null);
    const isRestoringPositionRef = useRef(false);
    const isFlushingSegmentRef = useRef(false);
    const hasPlaybackInteractionRef = useRef(false);
    const isSeekingRef = useRef(false);
    const hasEndedRef = useRef(false);

    const getYoutubeThumbnail = (srcLink: string) => {
        let videoId = "";
        try {
            const url = new URL(srcLink);
            if (url.hostname.includes("youtu.be")) {
                videoId = url.pathname.slice(1);
            } else if (url.hostname.includes("youtube.com")) {
                videoId = url.searchParams.get("v") || "";
            }
        } catch (e) {
            return '';
        }
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
    };

    const thumbnail = getYoutubeThumbnail(videoUrl);

    const getRoundedCurrentSecond = useCallback(() => {
        return Math.max(
            0,
            Math.round(playerRef.current?.currentTime ?? lastObservedSecondRef.current ?? 0),
        );
    }, []);

    const resetTrackingPoint = useCallback((second: number) => {
        const normalizedSecond = Math.max(0, Math.round(second));
        segmentStartSecondRef.current = normalizedSecond;
        lastObservedSecondRef.current = normalizedSecond;
    }, []);

    const stopProgressTimer = useCallback(() => {
        if (progressTimerRef.current !== null) {
            window.clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
        }
    }, []);

    const saveCurrentPosition = useCallback(
        async (position?: number) => {
            if (!params.id || !currentLessonId) return;
            if (isFlushingSegmentRef.current) return;

            const currentSecond = Math.max(
                0,
                Math.round(position ?? getRoundedCurrentSecond()),
            );

            if (lastSavedSecondRef.current === currentSecond) {
                resetTrackingPoint(currentSecond);
                return;
            }

            isFlushingSegmentRef.current = true;

            try {
                const response = await mutateAsync({
                    studentCourseId: params.id,
                    lessonId: currentLessonId,
                    currentSecond,
                });
                lastSavedSecondRef.current = currentSecond;
                onProgressChange?.(response || null);
                setEnded(Boolean(response?.completed));
            } finally {
                isFlushingSegmentRef.current = false;
                resetTrackingPoint(currentSecond);
            }
        },
        [
            currentLessonId,
            getRoundedCurrentSecond,
            mutateAsync,
            onProgressChange,
            params.id,
            resetTrackingPoint,
            setEnded,
        ],
    );

    const flushTrackedSegment = useCallback(
        async (trackedToSecond?: number) => {
            if (!params.id || !currentLessonId) return;
            if (isFlushingSegmentRef.current) return;

            const watchedFromSecond = segmentStartSecondRef.current;
            const watchedToSecond = Math.max(
                0,
                Math.round(trackedToSecond ?? lastObservedSecondRef.current ?? getRoundedCurrentSecond()),
            );

            if (
                typeof watchedFromSecond !== "number" ||
                watchedToSecond <= watchedFromSecond
            ) {
                await saveCurrentPosition(watchedToSecond);
                return;
            }

            isFlushingSegmentRef.current = true;

            try {
                const response = await mutateAsync({
                    studentCourseId: params.id,
                    lessonId: currentLessonId,
                    currentSecond: watchedToSecond,
                    watchedFromSecond,
                    watchedToSecond,
                });
                lastSavedSecondRef.current = watchedToSecond;
                onProgressChange?.(response || null);
                setEnded(Boolean(response?.completed));
            } finally {
                isFlushingSegmentRef.current = false;
                resetTrackingPoint(watchedToSecond);
            }
        },
        [
            currentLessonId,
            getRoundedCurrentSecond,
            mutateAsync,
            onProgressChange,
            params.id,
            saveCurrentPosition,
            resetTrackingPoint,
            setEnded,
        ],
    );

    const startProgressTimer = useCallback(() => {
        stopProgressTimer();

        progressTimerRef.current = window.setInterval(() => {
            const currentSecond = getRoundedCurrentSecond();
            const watchedFromSecond = segmentStartSecondRef.current;

            if (
                typeof watchedFromSecond === "number" &&
                currentSecond > watchedFromSecond
            ) {
                void flushTrackedSegment(currentSecond);
            }
        }, PROGRESS_INTERVAL_MS);
    }, [flushTrackedSegment, getRoundedCurrentSecond, stopProgressTimer]);

    useEffect(() => {
        const normalizedStartTime = Math.max(0, Math.round(startTime || 0));

        restoreTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
        restoreTimeoutsRef.current = [];
        stopProgressTimer();
        lastRestoredStartTimeRef.current = null;
        hasPlaybackInteractionRef.current = false;
        lastSavedSecondRef.current = null;
        isSeekingRef.current = false;
        isRestoringPositionRef.current = false;
        hasEndedRef.current = false;

        resetTrackingPoint(normalizedStartTime);

        return () => {
            restoreTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
            restoreTimeoutsRef.current = [];
            stopProgressTimer();
        };
    }, [resetTrackingPoint, stopProgressTimer, videoUrl]);

    useEffect(() => {
        const normalizedStartTime = Math.max(0, Math.round(startTime || 0));

        if (!playerRef.current) return;
        if (hasPlaybackInteractionRef.current) return;
        if (lastRestoredStartTimeRef.current === normalizedStartTime) return;

        lastRestoredStartTimeRef.current = normalizedStartTime;
        resetTrackingPoint(normalizedStartTime);

        if (normalizedStartTime <= 0) return;

        isRestoringPositionRef.current = true;
        playerRef.current.currentTime = normalizedStartTime;

        restoreTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
        restoreTimeoutsRef.current = [120, 400, 900].map((delay) =>
            window.setTimeout(() => {
                if (!playerRef.current) return;
                isRestoringPositionRef.current = true;
                playerRef.current.currentTime = normalizedStartTime;
            }, delay),
        );
    }, [resetTrackingPoint, startTime, videoUrl]);

    useEffect(() => {
        setEnded(false);
    }, [setEnded, videoUrl]);

    const handleTimeUpdate = useCallback(() => {
        const roundedCurrentTime = getRoundedCurrentSecond();

        if (isRestoringPositionRef.current) {
            isRestoringPositionRef.current = false;
            resetTrackingPoint(roundedCurrentTime);
            return;
        }

        if (lastObservedSecondRef.current === null) {
            resetTrackingPoint(roundedCurrentTime);
            return;
        }

        hasPlaybackInteractionRef.current = true;
        lastObservedSecondRef.current = roundedCurrentTime;
    }, [getRoundedCurrentSecond, resetTrackingPoint]);

    const handlePlay = useCallback(() => {
        if (isRestoringPositionRef.current) return;
        isSeekingRef.current = false;
        hasEndedRef.current = false;
        hasPlaybackInteractionRef.current = true;
        const currentSecond = getRoundedCurrentSecond();
        resetTrackingPoint(currentSecond);
        startProgressTimer();
    }, [getRoundedCurrentSecond, resetTrackingPoint, startProgressTimer]);

    const handlePause = useCallback(() => {
        if (isRestoringPositionRef.current) return;
        if (isSeekingRef.current) return;
        if (hasEndedRef.current) return;
        hasPlaybackInteractionRef.current = true;
        stopProgressTimer();
        const currentSecond = getRoundedCurrentSecond();
        const watchedFromSecond = segmentStartSecondRef.current;

        if (typeof watchedFromSecond === "number" && currentSecond > watchedFromSecond) {
            void flushTrackedSegment(currentSecond);
            return;
        }

        void saveCurrentPosition(currentSecond);
    }, [flushTrackedSegment, getRoundedCurrentSecond, saveCurrentPosition, stopProgressTimer]);

    const handleSeeking = useCallback(() => {
        if (isRestoringPositionRef.current) return;
        isSeekingRef.current = true;
        hasPlaybackInteractionRef.current = true;
        stopProgressTimer();
        const previousSecond = lastObservedSecondRef.current ?? getRoundedCurrentSecond();
        const watchedFromSecond = segmentStartSecondRef.current;

        if (typeof watchedFromSecond === "number" && previousSecond > watchedFromSecond) {
            void flushTrackedSegment(previousSecond);
            return;
        }

        void saveCurrentPosition(previousSecond);
    }, [flushTrackedSegment, getRoundedCurrentSecond, saveCurrentPosition, stopProgressTimer]);

    const handleSeeked = useCallback(() => {
        const currentSecond = getRoundedCurrentSecond();

        if (isRestoringPositionRef.current) {
            isRestoringPositionRef.current = false;
            resetTrackingPoint(currentSecond);
            return;
        }

        isSeekingRef.current = false;
        hasPlaybackInteractionRef.current = true;
        resetTrackingPoint(currentSecond);
        void saveCurrentPosition(currentSecond);

        if (!playerRef.current?.paused && !hasEndedRef.current) {
            startProgressTimer();
        }
    }, [getRoundedCurrentSecond, resetTrackingPoint, saveCurrentPosition, startProgressTimer]);

    const handleEnded = useCallback(() => {
        if (isRestoringPositionRef.current) return;
        hasEndedRef.current = true;
        hasPlaybackInteractionRef.current = true;
        stopProgressTimer();
        const currentSecond = getRoundedCurrentSecond();
        const watchedFromSecond = segmentStartSecondRef.current;

        if (typeof watchedFromSecond === "number" && currentSecond > watchedFromSecond) {
            void flushTrackedSegment(currentSecond);
        } else {
            void saveCurrentPosition(currentSecond);
        }

        setEnded(true);
    }, [flushTrackedSegment, getRoundedCurrentSecond, saveCurrentPosition, setEnded, stopProgressTimer]);

    useEffect(() => {
        const handlePageHide = () => {
            stopProgressTimer();
            const currentSecond = getRoundedCurrentSecond();
            const watchedFromSecond = segmentStartSecondRef.current;

            if (typeof watchedFromSecond === "number" && currentSecond > watchedFromSecond) {
                void flushTrackedSegment(currentSecond);
                return;
            }

            void saveCurrentPosition(currentSecond);
        };

        window.addEventListener("pagehide", handlePageHide);
        window.addEventListener("beforeunload", handlePageHide);

        return () => {
            window.removeEventListener("pagehide", handlePageHide);
            window.removeEventListener("beforeunload", handlePageHide);
            stopProgressTimer();
            const currentSecond = getRoundedCurrentSecond();
            const watchedFromSecond = segmentStartSecondRef.current;

            if (typeof watchedFromSecond === "number" && currentSecond > watchedFromSecond) {
                void flushTrackedSegment(currentSecond);
                return;
            }

            void saveCurrentPosition(currentSecond);
        };
    }, [flushTrackedSegment, getRoundedCurrentSecond, saveCurrentPosition, stopProgressTimer]);


    return (
        <MediaPlayer ref={playerRef} key={videoUrl}
                     title="Lesson Video"
                     src={videoUrl}
                     poster={thumbnail}
                     className="vds-player lesson-video-player"
                     onTimeUpdate={handleTimeUpdate}
                     onPlay={handlePlay}
                     onPause={handlePause}
                     onSeeking={handleSeeking}
                     onSeeked={handleSeeked}
                     onEnded={handleEnded}
                     >
            <MediaProvider>
                <Poster className="vds-poster"/>
                <SeekButton className="vds-button" seconds={10}>
                    10
                </SeekButton>
            </MediaProvider>
            <DefaultVideoLayout
                icons={customIcons as DefaultLayoutIcons}
                slots={{
                    smallLayout: {
                        seekBackwardButton: <SeekButton seconds={-5}/>,
                        seekForwardButton: <SeekButton seconds={5}/>
                    },
                    largeLayout: {
                        seekBackwardButton: <SeekButton seconds={-5}/>,
                        seekForwardButton: <SeekButton seconds={5}/>
                    }
                }}
            />
        </MediaPlayer>
    );
};

export default VideoPlayer;
