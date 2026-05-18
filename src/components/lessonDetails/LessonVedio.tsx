import {
    MediaPlayer, MediaPlayerInstance, MediaProvider, Poster
} from '@vidstack/react';
import {defaultLayoutIcons, DefaultLayoutIcons, DefaultVideoLayout} from '@vidstack/react/player/layouts/default';
import {Mute, VolumeHigh, VolumeLow} from "../../assets/icon";
import {useCallback, useEffect, useRef, useState} from "react";
import {useUpdateLessonProgress} from "../../api/lessonProgress/useLessonProgress.ts";
import {useParams} from "react-router-dom";

const PROGRESS_INTERVAL_MS = 10000;

type SupportedOrientationLock = "any" | "natural" | "landscape" | "portrait" | "portrait-primary" | "portrait-secondary" | "landscape-primary" | "landscape-secondary";

type ScreenOrientationWithLock = ScreenOrientation & {
    lock?: (orientation: SupportedOrientationLock) => Promise<void>;
    unlock?: () => void;
};

type VideoElementWithWebkitFullscreen = HTMLVideoElement & {
    webkitEnterFullscreen?: () => void;
    webkitExitFullscreen?: () => void;
    webkitDisplayingFullscreen?: boolean;
    webkitSupportsFullscreen?: boolean;
    webkitSetPresentationMode?: (mode: "inline" | "fullscreen" | "picture-in-picture") => void;
    webkitPresentationMode?: "inline" | "fullscreen" | "picture-in-picture";
};

const videoLayoutIcons: DefaultLayoutIcons = {
    ...defaultLayoutIcons,
    MuteButton: {
        Mute: () => <Mute width={24} height={24} />,
        VolumeLow: () => <VolumeLow width={24} height={24} />,
        VolumeHigh: () => <VolumeHigh width={24} height={24} />,
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
    const isSafariBrowser =
        typeof navigator !== "undefined" &&
        /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(navigator.userAgent);

    const playerRef = useRef<MediaPlayerInstance>(null);
    const nativeVideoRef = useRef<HTMLVideoElement | null>(null);
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
    const [isFullscreenActive, setIsFullscreenActive] = useState(false);

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
    const isYoutubeSource = (() => {
        try {
            const url = new URL(videoUrl);
            return (
                url.hostname.includes("youtube.com") ||
                url.hostname.includes("youtu.be") ||
                url.hostname.includes("youtube-nocookie.com")
            );
        } catch {
            return /youtube|youtu\.be/i.test(videoUrl);
        }
    })();
    const useSafariNativeVideo = isSafariBrowser && !isYoutubeSource;

    const getPlaybackCurrentTime = useCallback(() => {
        if (nativeVideoRef.current) {
            return nativeVideoRef.current.currentTime;
        }

        return playerRef.current?.currentTime ?? lastObservedSecondRef.current ?? 0;
    }, []);

    const setPlaybackCurrentTime = useCallback((time: number) => {
        if (nativeVideoRef.current) {
            nativeVideoRef.current.currentTime = time;
            return;
        }

        if (playerRef.current) {
            playerRef.current.currentTime = time;
        }
    }, []);

    const isPlaybackPaused = useCallback(() => {
        if (nativeVideoRef.current) {
            return nativeVideoRef.current.paused;
        }

        return playerRef.current?.paused ?? true;
    }, []);

    const clearRestoreTimeouts = useCallback(() => {
        restoreTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
        restoreTimeoutsRef.current = [];
    }, []);

    const getRoundedCurrentSecond = useCallback(() => {
        return Math.max(
            0,
            Math.round(getPlaybackCurrentTime()),
        );
    }, [getPlaybackCurrentTime]);

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
        async (
            position?: number,
            options?: {
                includeWatchedPoint?: boolean;
            },
        ) => {
            if (!params.id || !currentLessonId) return;
            if (isFlushingSegmentRef.current) return;

            const currentSecond = Math.max(
                0,
                Math.round(position ?? getRoundedCurrentSecond()),
            );
            const includeWatchedPoint = options?.includeWatchedPoint ?? true;

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
                    ...(includeWatchedPoint
                        ? {
                              watchedFromSecond: currentSecond,
                              watchedToSecond: currentSecond,
                          }
                        : {}),
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

        clearRestoreTimeouts();
        stopProgressTimer();
        lastRestoredStartTimeRef.current = null;
        hasPlaybackInteractionRef.current = false;
        lastSavedSecondRef.current = null;
        isSeekingRef.current = false;
        isRestoringPositionRef.current = false;
        hasEndedRef.current = false;

        resetTrackingPoint(normalizedStartTime);

        return () => {
            clearRestoreTimeouts();
            stopProgressTimer();
        };
    }, [clearRestoreTimeouts, resetTrackingPoint, stopProgressTimer, videoUrl]);

    useEffect(() => {
        const normalizedStartTime = Math.max(0, Math.round(startTime || 0));

        if (!playerRef.current) return;
        if (hasPlaybackInteractionRef.current) return;
        if (lastRestoredStartTimeRef.current === normalizedStartTime) return;

        lastRestoredStartTimeRef.current = normalizedStartTime;
        resetTrackingPoint(normalizedStartTime);

        if (normalizedStartTime <= 0) return;

        isRestoringPositionRef.current = true;
        setPlaybackCurrentTime(normalizedStartTime);

        clearRestoreTimeouts();
        restoreTimeoutsRef.current = [120, 400, 900].map((delay) =>
            window.setTimeout(() => {
                if (!playerRef.current && !nativeVideoRef.current) return;
                if (hasPlaybackInteractionRef.current) return;
                isRestoringPositionRef.current = true;
                setPlaybackCurrentTime(normalizedStartTime);
            }, delay),
        );
    }, [clearRestoreTimeouts, resetTrackingPoint, setPlaybackCurrentTime, startTime, videoUrl]);

    useEffect(() => {
        setEnded(false);
    }, [setEnded, videoUrl]);

    const getVideoElement = useCallback(() => {
        if (nativeVideoRef.current) {
            return nativeVideoRef.current as VideoElementWithWebkitFullscreen;
        }

        return playerRef.current?.el?.querySelector("video") as VideoElementWithWebkitFullscreen | null;
    }, []);

    const syncFullscreenState = useCallback(() => {
        const playerElement = playerRef.current?.el;
        const videoElement = getVideoElement();
        const standardFullscreen =
            document.fullscreenElement === playerElement ||
            Boolean(playerElement && document.fullscreenElement && playerElement.contains(document.fullscreenElement));
        const providerFullscreen =
            Boolean(videoElement?.webkitDisplayingFullscreen) ||
            videoElement?.webkitPresentationMode === "fullscreen";

        setIsFullscreenActive(standardFullscreen || providerFullscreen);
    }, [getVideoElement]);

    useEffect(() => {
        const orientation = screen.orientation as ScreenOrientationWithLock;
        const canLockOrientation =
            typeof window !== "undefined" &&
            "orientation" in screen &&
            typeof orientation.lock === "function";

        if (!canLockOrientation) {
            return;
        }

        const handleFullscreenChange = () => {
            syncFullscreenState();
            const videoElement = getVideoElement();
            const isFullscreen =
                document.fullscreenElement === playerRef.current?.el ||
                playerRef.current?.el?.contains(document.fullscreenElement) ||
                Boolean(videoElement?.webkitDisplayingFullscreen) ||
                videoElement?.webkitPresentationMode === "fullscreen";

            if (isFullscreen) {
                void orientation.lock?.("landscape").catch(() => undefined);
                return;
            }

            if (typeof orientation.unlock === "function") {
                orientation.unlock();
            }
        };

        const videoElement = getVideoElement();
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        videoElement?.addEventListener("webkitbeginfullscreen", handleFullscreenChange);
        videoElement?.addEventListener("webkitendfullscreen", handleFullscreenChange);
        videoElement?.addEventListener("webkitpresentationmodechanged", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            videoElement?.removeEventListener("webkitbeginfullscreen", handleFullscreenChange);
            videoElement?.removeEventListener("webkitendfullscreen", handleFullscreenChange);
            videoElement?.removeEventListener("webkitpresentationmodechanged", handleFullscreenChange);
            if (typeof orientation.unlock === "function") {
                orientation.unlock();
            }
        };
    }, [getVideoElement, syncFullscreenState]);

    useEffect(() => {
        const handleFullscreenStateChange = () => {
            syncFullscreenState();
        };

        const videoElement = getVideoElement();
        syncFullscreenState();

        document.addEventListener("fullscreenchange", handleFullscreenStateChange);
        videoElement?.addEventListener("webkitbeginfullscreen", handleFullscreenStateChange);
        videoElement?.addEventListener("webkitendfullscreen", handleFullscreenStateChange);
        videoElement?.addEventListener("webkitpresentationmodechanged", handleFullscreenStateChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenStateChange);
            videoElement?.removeEventListener("webkitbeginfullscreen", handleFullscreenStateChange);
            videoElement?.removeEventListener("webkitendfullscreen", handleFullscreenStateChange);
            videoElement?.removeEventListener("webkitpresentationmodechanged", handleFullscreenStateChange);
        };
    }, [getVideoElement, syncFullscreenState, videoUrl]);

    const handleFullscreenToggle = useCallback(() => {
        if (isFullscreenActive) {
            void playerRef.current?.exitFullscreen("provider").catch(() => {
                void playerRef.current?.exitFullscreen().catch(() => undefined);
            });
            return;
        }

        void playerRef.current?.enterFullscreen("provider").catch(() => {
            void playerRef.current?.enterFullscreen().catch(() => undefined);
        });
    }, [isFullscreenActive]);

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
        clearRestoreTimeouts();
        isSeekingRef.current = false;
        hasEndedRef.current = false;
        hasPlaybackInteractionRef.current = true;
        const currentSecond = getRoundedCurrentSecond();
        resetTrackingPoint(currentSecond);
        startProgressTimer();
    }, [clearRestoreTimeouts, getRoundedCurrentSecond, resetTrackingPoint, startProgressTimer]);

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
        clearRestoreTimeouts();
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

        if (!isPlaybackPaused() && !hasEndedRef.current) {
            startProgressTimer();
        }
    }, [clearRestoreTimeouts, getRoundedCurrentSecond, isPlaybackPaused, resetTrackingPoint, saveCurrentPosition, startProgressTimer]);

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

    if (useSafariNativeVideo) {
        return (
            <video
                key={videoUrl}
                ref={nativeVideoRef}
                src={videoUrl}
                poster={thumbnail || undefined}
                playsInline
                controls
                preload="metadata"
                className="lesson-video-player"
                onTimeUpdate={handleTimeUpdate}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeeking={handleSeeking}
                onSeeked={handleSeeked}
                onEnded={handleEnded}
            />
        );
    }

    return (
        <MediaPlayer ref={playerRef} key={videoUrl}
                     title="Lesson Video"
                     src={videoUrl}
                     poster={thumbnail}
                     playsInline
                     fullscreenOrientation="landscape"
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
            </MediaProvider>
            <DefaultVideoLayout
                icons={videoLayoutIcons}
                slots={{
                    smallLayout: {
                        fullscreenButton: (
                            <button
                                type="button"
                                className="vds-button vds-fullscreen-button"
                                aria-label={isFullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    handleFullscreenToggle();
                                }}
                            >
                                {isFullscreenActive ? (
                                    <defaultLayoutIcons.FullscreenButton.Exit className="vds-icon" width={24} height={24}/>
                                ) : (
                                    <defaultLayoutIcons.FullscreenButton.Enter className="vds-icon" width={24} height={24}/>
                                )}
                            </button>
                        ),
                    },
                }}
            />
        </MediaPlayer>
    );
};

export default VideoPlayer;
