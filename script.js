// ============================================================
// PRSN — PRIVATE NETWORK
// MAIN SCRIPT
// ============================================================


// ============================================================
// SUPABASE
// ============================================================

const PRSN_CONFIG = window.PRSN_CONFIG || {

    SUPABASE_URL:
        "https://xvvtzhqyihwgjdzdqkvx.supabase.co",

    SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_Gp8pbf7ciC-QHUhMg6lyzA_WT6UaKoB"

};


const supabaseClient =
    window.supabase.createClient(
        PRSN_CONFIG.SUPABASE_URL,
        PRSN_CONFIG.SUPABASE_PUBLISHABLE_KEY
    );


// ============================================================
// PRSN SETTINGS
// ============================================================

const ALLOWED_USERS = [
    "PRASHANT",
    "SHYAM",
    "RAVI",
    "NUKS"
];

const CHAT_CODE =
    "BACHYO";

const INITIAL_MESSAGES_LIMIT =
    50;

const MAX_IMAGE_SIZE =
    5 * 1024 * 1024;

const MAX_VOICE_SIZE =
    10 * 1024 * 1024;


// ============================================================
// STATE
// ============================================================

let currentUser =
    null;

let chatName =
    null;

let chatChannel =
    null;

let galleryChannel =
    null;


// ============================================================
// VOICE STATE
// ============================================================

let mediaRecorder =
    null;

let voiceStream =
    null;

let voiceChunks =
    [];

let voiceRecording =
    false;

let voiceCancelled =
    false;

let voiceStartTime =
    null;

let voiceTimerInterval =
    null;

let chatMusicWasPlaying =
    false;


// ============================================================
// ELEMENTS
// ============================================================

const nameScreen =
    document.getElementById(
        "nameScreen"
    );

const dashboard =
    document.getElementById(
        "dashboard"
    );

const nameInput =
    document.getElementById(
        "nameInput"
    );

const enterBtn =
    document.getElementById(
        "enterBtn"
    );

const nameError =
    document.getElementById(
        "nameError"
    );

const currentUserElement =
    document.getElementById(
        "currentUser"
    );

const welcomeUser =
    document.getElementById(
        "welcomeUser"
    );


const bgMusic =
    document.getElementById(
        "bgMusic"
    );

const chatMusic =
    document.getElementById(
        "chatMusic"
    );

const musicBtn =
    document.getElementById(
        "musicBtn"
    );


const chatBtn =
    document.getElementById(
        "chatBtn"
    );

const chatModal =
    document.getElementById(
        "chatModal"
    );

const closeChat =
    document.getElementById(
        "closeChat"
    );

const chatCodeInput =
    document.getElementById(
        "chatCode"
    );

const unlockChat =
    document.getElementById(
        "unlockChat"
    );

const chatError =
    document.getElementById(
        "chatError"
    );


const chatScreen =
    document.getElementById(
        "chatScreen"
    );

const backFromChat =
    document.getElementById(
        "backFromChat"
    );

const messagesBox =
    document.getElementById(
        "messages"
    );

const messageInput =
    document.getElementById(
        "messageInput"
    );

const sendMessageBtn =
    document.getElementById(
        "sendMessage"
    );

const photoInput =
    document.getElementById(
        "photoInput"
    );


const voiceRecordBtn =
    document.getElementById(
        "voiceRecordBtn"
    );

const voiceStatus =
    document.getElementById(
        "voiceStatus"
    );

const voiceStatusText =
    document.getElementById(
        "voiceStatusText"
    );

const voiceTimer =
    document.getElementById(
        "voiceTimer"
    );


const galleryBtn =
    document.getElementById(
        "galleryBtn"
    );

const galleryScreen =
    document.getElementById(
        "galleryScreen"
    );

const backFromGallery =
    document.getElementById(
        "backFromGallery"
    );

const galleryInput =
    document.getElementById(
        "galleryInput"
    );

const galleryGrid =
    document.getElementById(
        "galleryGrid"
    );


const cursorGlow =
    document.getElementById(
        "cursorGlow"
    );


// ============================================================
// BASIC HELPERS
// ============================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(
            value ?? ""
        );

    return div.innerHTML;
}


function scrollMessagesToBottom() {

    if (!messagesBox) {
        return;
    }

    messagesBox.scrollTop =
        messagesBox.scrollHeight;
}


function formatMessageTime(
    date
) {

    return new Date(date)
        .toLocaleTimeString(
            [],
            {
                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        );
}


function formatGalleryDate(
    date
) {

    return new Date(date)
        .toLocaleDateString(
            [],
            {
                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric"
            }
        );
}


// ============================================================
// UI MESSAGE
// ============================================================

function showTemporaryError(
    element,
    text
) {

    if (!element) {
        return;
    }

    element.textContent =
        text;

    setTimeout(
        () => {

            if (
                element.textContent ===
                text
            ) {

                element.textContent =
                    "";

            }

        },
        3500
    );
}


// ============================================================
// ENTER PRSN
// ============================================================

async function enterPRSN() {

    const typedName =
        nameInput.value
            .trim()
            .toUpperCase();


    nameError.textContent =
        "";


    if (!typedName) {

        showTemporaryError(
            nameError,
            "ENTER YOUR IDENTITY."
        );

        return;
    }


    if (
        !ALLOWED_USERS.includes(
            typedName
        )
    ) {

        showTemporaryError(
            nameError,
            "IDENTITY NOT RECOGNIZED."
        );

        return;
    }


    currentUser =
        typedName;

    chatName =
        currentUser;


    currentUserElement.textContent =
        currentUser;

    welcomeUser.textContent =
        currentUser;


    nameScreen.classList.remove(
        "active"
    );

    dashboard.classList.add(
        "active"
    );


    if (bgMusic) {

        bgMusic.volume =
            0.34;

        bgMusic.currentTime =
            0;

        bgMusic
            .play()
            .catch(
                () => {}
            );

    }


    await updateLastSeen();

}


// ============================================================
// ENTRY EVENTS
// ============================================================

enterBtn.addEventListener(
    "click",
    enterPRSN
);


nameInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            enterPRSN();

        }

    }
);


// ============================================================
// MUSIC
// ============================================================

musicBtn.addEventListener(
    "click",
    () => {

        if (!bgMusic) {
            return;
        }


        if (
            bgMusic.paused
        ) {

            bgMusic
                .play()
                .catch(
                    () => {}
                );

            musicBtn.innerHTML =
                "<span>♫</span>";

        }

        else {

            bgMusic.pause();

            musicBtn.innerHTML =
                "<span>♪</span>";

        }

    }
);


// ============================================================
// OPEN CHAT CODE MODAL
// ============================================================

chatBtn.addEventListener(
    "click",
    () => {

        chatModal.classList.remove(
            "hidden"
        );

        chatCodeInput.value =
            "";

        chatError.textContent =
            "";


        setTimeout(
            () => {

                chatCodeInput.focus();

            },
            150
        );

    }
);


// ============================================================
// CLOSE CHAT MODAL
// ============================================================

function closeChatModal() {

    chatModal.classList.add(
        "hidden"
    );

    chatCodeInput.value =
        "";

    chatError.textContent =
        "";
}


closeChat.addEventListener(
    "click",
    closeChatModal
);


chatModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            chatModal
        ) {

            closeChatModal();

        }

    }
);


// ============================================================
// CHAT CODE
// ============================================================

async function unlockPrivateChat() {

    const code =
        chatCodeInput.value
            .trim()
            .toUpperCase();


    if (
        code !==
        CHAT_CODE
    ) {

        showTemporaryError(
            chatError,
            "ACCESS CODE REJECTED."
        );

        return;
    }


    closeChatModal();


    chatName =
        currentUser;


    if (bgMusic) {

        bgMusic.pause();

        bgMusic.currentTime =
            0;

    }


    if (chatMusic) {

        chatMusic.volume =
            0.28;

        chatMusic.currentTime =
            0;

        chatMusic
            .play()
            .catch(
                () => {}
            );

    }


    dashboard.classList.remove(
        "active"
    );

    chatScreen.classList.remove(
        "hidden"
    );


    await loadMessages();

    startRealtimeChat();


    setTimeout(
        () => {

            messageInput.focus();

        },
        150
    );

}


unlockChat.addEventListener(
    "click",
    unlockPrivateChat
);


chatCodeInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            unlockPrivateChat();

        }

    }
);


// ============================================================
// BACK FROM CHAT
// ============================================================

backFromChat.addEventListener(
    "click",
    async () => {

        if (
            voiceRecording
        ) {

            await cancelVoiceRecording();

        }


        chatScreen.classList.add(
            "hidden"
        );

        dashboard.classList.add(
            "active"
        );


        if (chatMusic) {

            chatMusic.pause();

            chatMusic.currentTime =
                0;

        }


        chatMusicWasPlaying =
            false;


        if (bgMusic) {

            bgMusic.currentTime =
                0;

            bgMusic
                .play()
                .catch(
                    () => {}
                );

        }

    }
);


// ============================================================
// LOAD MESSAGES
// ============================================================

async function loadMessages() {

    messagesBox.innerHTML = `
        <div class="gallery-loading">
            LOADING PRIVATE CONVERSATION...
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                "messages"
            )

            .select(
                "*"
            )

            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            )

            .limit(
                INITIAL_MESSAGES_LIMIT
            );


    if (error) {

        console.error(
            "Message loading error:",
            error
        );

        messagesBox.innerHTML = `
            <div class="gallery-loading">
                MESSAGES COULD NOT LOAD
            </div>
        `;

        return;
    }


    const orderedMessages =
        [...data]
            .reverse();


    const elements =
        await Promise.all(

            orderedMessages.map(
                message =>
                    createMessageElement(
                        message
                    )
            )

        );


    messagesBox.innerHTML =
        "";


    const fragment =
        document
            .createDocumentFragment();


    elements.forEach(
        element => {

            if (element) {

                fragment
                    .appendChild(
                        element
                    );

            }

        }
    );


    messagesBox.appendChild(
        fragment
    );


    requestAnimationFrame(
        scrollMessagesToBottom
    );

}


// ============================================================
// CREATE MESSAGE
// ============================================================

async function createMessageElement(
    message
) {

    const div =
        document.createElement(
            "div"
        );


    const isMine =
        message.sender_name ===
        chatName;


    div.className =
        isMine
            ? "message mine"
            : "message";


    div.dataset.messageId =
        message.id;


    const nameHTML =
        escapeHTML(
            message.sender_name
        );


    const time =
        formatMessageTime(
            message.created_at
        );


    let contentHTML =
        "";


    // ========================================================
    // IMAGE MESSAGE
    // ========================================================

    if (
        message.message_type ===
            "image" &&
        message.file_path
    ) {

        const {
            data,
            error
        } =
            await supabaseClient

                .storage

                .from(
                    "chat-images"
                )

                .createSignedUrl(
                    message.file_path,
                    3600
                );


        if (
            !error &&
            data
        ) {

            contentHTML = `

                <img
                    src="${data.signedUrl}"
                    class="message-image"
                    loading="lazy"
                    alt="Shared photo"
                >

            `;

        }

        else {

            contentHTML = `

                <div class="message-text">
                    PHOTO UNAVAILABLE
                </div>

            `;

        }

    }


    // ========================================================
    // VOICE MESSAGE
    // ========================================================

    else if (
        message.message_type ===
            "voice" &&
        message.file_path
    ) {

        const {
            data,
            error
        } =
            await supabaseClient

                .storage

                .from(
                    "chat-voice"
                )

                .createSignedUrl(
                    message.file_path,
                    3600
                );


        if (
            !error &&
            data
        ) {

            contentHTML = `

                <div class="voice-message">

                    <div class="voice-message-icon">
                        ◉
                    </div>

                    <audio
                        class="voice-audio"
                        controls
                        preload="metadata"
                        src="${data.signedUrl}"
                    ></audio>

                </div>

            `;

        }

        else {

            contentHTML = `

                <div class="message-text">
                    VOICE UNAVAILABLE
                </div>

            `;

        }

    }


    // ========================================================
    // TEXT MESSAGE
    // ========================================================

    else {

        contentHTML = `

            <div class="message-text">

                ${escapeHTML(
                    message.message ||
                    ""
                )}

            </div>

        `;

    }


    // ========================================================
    // DELETE MENU
    // ========================================================

    let deleteHTML =
        "";


    if (isMine) {

        deleteHTML = `

            <button
                class="message-delete-btn"
                type="button"
                title="Message options"
            >
                •••
            </button>

            <div
                class="message-delete-menu hidden"
            >

                <button
                    class="delete-action"
                    type="button"
                >
                    DELETE MESSAGE
                </button>

            </div>

        `;

    }


    // ========================================================
    // FINAL MESSAGE HTML
    // ========================================================

    div.innerHTML = `

        <div class="message-top-row">

            <div class="message-name">
                ${nameHTML}
            </div>

            ${deleteHTML}

        </div>

        ${contentHTML}

        <div class="message-time">
            ${time}
        </div>

    `;


// ============================================================
// IMAGE OPEN
// ============================================================

    const image =
        div.querySelector(
            ".message-image"
        );


    if (image) {

        image.addEventListener(
            "click",
            () => {

                window.open(
                    image.src,
                    "_blank"
                );

            }
        );

    }


// ============================================================
// DELETE MENU EVENTS
// ============================================================

    const deleteBtn =
        div.querySelector(
            ".message-delete-btn"
        );


    const deleteMenu =
        div.querySelector(
            ".message-delete-menu"
        );


    const deleteAction =
        div.querySelector(
            ".delete-action"
        );


    if (
        deleteBtn &&
        deleteMenu &&
        deleteAction
    ) {

        deleteBtn.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                document
                    .querySelectorAll(
                        ".message-delete-menu"
                    )
                    .forEach(
                        menu => {

                            if (
                                menu !==
                                deleteMenu
                            ) {

                                menu
                                    .classList
                                    .add(
                                        "hidden"
                                    );

                            }

                        }
                    );


                deleteMenu
                    .classList
                    .toggle(
                        "hidden"
                    );

            }
        );


        deleteAction.addEventListener(
            "click",
            async event => {

                event.stopPropagation();


                deleteMenu
                    .classList
                    .add(
                        "hidden"
                    );


                const confirmed =
                    confirm(
                        "Delete this message?"
                    );


                if (!confirmed) {
                    return;
                }


                await deleteMessage(
                    message
                );

            }
        );

    }


// ============================================================
// VOICE PLAYER MUSIC CONTROL
// ============================================================

    const voiceAudio =
        div.querySelector(
            ".voice-audio"
        );


    if (voiceAudio) {

        voiceAudio.addEventListener(
            "play",
            () => {

                pauseChatMusicForVoice();

            }
        );


        voiceAudio.addEventListener(
            "pause",
            () => {

                if (
                    Number.isFinite(
                        voiceAudio.duration
                    ) &&
                    voiceAudio.currentTime <
                    voiceAudio.duration
                ) {

                    resumeChatMusicAfterVoice();

                }

            }
        );


        voiceAudio.addEventListener(
            "ended",
            () => {

                resumeChatMusicAfterVoice();

            }
        );

    }


    return div;

}


// ============================================================
// DISPLAY REALTIME MESSAGE
// ============================================================

async function displayMessage(
    message
) {

    if (
        document.querySelector(
            `[data-message-id="${message.id}"]`
        )
    ) {

        return;

    }


    const element =
        await createMessageElement(
            message
        );


    if (!element) {
        return;
    }


    messagesBox.appendChild(
        element
    );


    scrollMessagesToBottom();

}


// ============================================================
// SEND TEXT MESSAGE
// ============================================================

async function sendMessage() {

    const text =
        messageInput.value
            .trim();


    if (
        !text ||
        !chatName
    ) {

        return;

    }


    sendMessageBtn.disabled =
        true;


    const originalText =
        sendMessageBtn.innerHTML;


    sendMessageBtn.innerHTML = `
        <span>SENDING</span>
        <span>•</span>
    `;


    const {
        error
    } =
        await supabaseClient

            .from(
                "messages"
            )

            .insert({

                sender_name:
                    chatName,

                message:
                    text,

                message_type:
                    "text",

                file_path:
                    null

            });


    sendMessageBtn.disabled =
        false;


    sendMessageBtn.innerHTML =
        originalText;


    if (error) {

        console.error(
            "Message send error:",
            error
        );

        alert(
            "Message send nahi hua."
        );

        return;
    }


    messageInput.value =
        "";


    messageInput.focus();

}


sendMessageBtn.addEventListener(
    "click",
    sendMessage
);


messageInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
                "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// ============================================================
// DELETE MESSAGE
// ============================================================

async function deleteMessage(
    message
) {

    if (
        message.sender_name !==
        chatName
    ) {

        return;

    }


    const {
        error
    } =
        await supabaseClient

            .from(
                "messages"
            )

            .delete()

            .eq(
                "id",
                message.id
            );


    if (error) {

        console.error(
            "Delete message error:",
            error
        );

        alert(
            "Message delete nahi hua."
        );

        return;
    }


    const element =
        document.querySelector(
            `[data-message-id="${message.id}"]`
        );


    if (element) {

        element.remove();

    }


    if (
        message.file_path &&
        message.message_type ===
            "image"
    ) {

        await supabaseClient

            .storage

            .from(
                "chat-images"
            )

            .remove([
                message.file_path
            ]);

    }


    if (
        message.file_path &&
        message.message_type ===
            "voice"
    ) {

        await supabaseClient

            .storage

            .from(
                "chat-voice"
            )

            .remove([
                message.file_path
            ]);

    }

}


// ============================================================
// PHOTO INPUT
// ============================================================

photoInput.addEventListener(
    "change",
    async event => {

        const file =
            event.target
                .files[0];


        if (!file) {
            return;
        }


        if (
            !file.type
                .startsWith(
                    "image/"
                )
        ) {

            alert(
                "Sirf image select kar."
            );

            photoInput.value =
                "";

            return;
        }


        if (
            file.size >
            MAX_IMAGE_SIZE
        ) {

            alert(
                "Photo 5MB se chhoti honi chahiye."
            );

            photoInput.value =
                "";

            return;
        }


        try {

            await sendPhoto(
                file
            );

        }

        catch (error) {

            console.error(
                "Photo error:",
                error
            );

            alert(
                "Photo send nahi hui."
            );

        }


        photoInput.value =
            "";

    }
);


// ============================================================
// SEND PHOTO
// ============================================================

async function sendPhoto(
    file
) {

    if (!chatName) {
        return;
    }


    const extension =
        (
            file.name
                .split(".")
                .pop() ||
            "jpg"
        )
            .toLowerCase();


    const safeFileName =
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2) +
        "." +
        extension;


    const filePath =
        "chat/" +
        safeFileName;


    const {
        error:
            uploadError
    } =
        await supabaseClient

            .storage

            .from(
                "chat-images"
            )

            .upload(
                filePath,
                file,
                {

                    cacheControl:
                        "3600",

                    contentType:
                        file.type,

                    upsert:
                        false

                }
            );


    if (uploadError) {

        throw uploadError;

    }


    const {
        error:
            dbError
    } =
        await supabaseClient

            .from(
                "messages"
            )

            .insert({

                sender_name:
                    chatName,

                message:
                    "Photo",

                message_type:
                    "image",

                file_path:
                    filePath

            });


    if (dbError) {

        await supabaseClient

            .storage

            .from(
                "chat-images"
            )

            .remove([
                filePath
            ]);


        throw dbError;

    }

}


// ============================================================
// CHAT MUSIC / VOICE
// ============================================================

function pauseChatMusicForVoice() {

    if (!chatMusic) {
        return;
    }


    chatMusicWasPlaying =
        !chatMusic.paused;


    if (
        chatMusicWasPlaying
    ) {

        chatMusic.pause();

    }

}


function resumeChatMusicAfterVoice() {

    if (
        chatMusicWasPlaying &&
        chatMusic
    ) {

        chatMusic
            .play()
            .catch(
                () => {}
            );

    }


    chatMusicWasPlaying =
        false;

}


// ============================================================
// VOICE EVENTS
// ============================================================

voiceRecordBtn.addEventListener(
    "pointerdown",
    startVoiceRecording
);


voiceRecordBtn.addEventListener(
    "pointerup",
    stopVoiceRecording
);


voiceRecordBtn.addEventListener(
    "pointerleave",
    () => {

        if (
            voiceRecording
        ) {

            stopVoiceRecording();

        }

    }
);


voiceRecordBtn.addEventListener(
    "pointercancel",
    () => {

        if (
            voiceRecording
        ) {

            cancelVoiceRecording();

        }

    }
);


voiceRecordBtn.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

    }
);


// ============================================================
// START VOICE RECORDING
// ============================================================

async function startVoiceRecording(
    event
) {

    event.preventDefault();


    if (
        voiceRecording ||
        !chatName
    ) {

        return;

    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
            .getUserMedia
    ) {

        alert(
            "Microphone supported nahi hai."
        );

        return;
    }


    pauseChatMusicForVoice();


    try {

        voiceStream =
            await navigator

                .mediaDevices

                .getUserMedia({
                    audio:
                        true
                });


        let mimeType =
            "audio/webm";


        if (
            typeof MediaRecorder !==
                "undefined" &&
            MediaRecorder
                .isTypeSupported(
                    "audio/webm;codecs=opus"
                )
        ) {

            mimeType =
                "audio/webm;codecs=opus";

        }

        else if (
            typeof MediaRecorder !==
                "undefined" &&
            MediaRecorder
                .isTypeSupported(
                    "audio/mp4"
                )
        ) {

            mimeType =
                "audio/mp4";

        }


        mediaRecorder =
            new MediaRecorder(
                voiceStream,
                {
                    mimeType
                }
            );


        voiceChunks =
            [];

        voiceCancelled =
            false;

        voiceRecording =
            true;

        voiceStartTime =
            Date.now();


        mediaRecorder.addEventListener(
            "dataavailable",
            event => {

                if (
                    event.data &&
                    event.data.size >
                        0
                ) {

                    voiceChunks.push(
                        event.data
                    );

                }

            }
        );


        mediaRecorder.addEventListener(
            "stop",
            async () => {

                const finalType =
                    mediaRecorder
                        .mimeType ||
                    mimeType;


                const blob =
                    new Blob(
                        voiceChunks,
                        {
                            type:
                                finalType
                        }
                    );


                const cancelled =
                    voiceCancelled;


                cleanupVoiceUI();

                stopVoiceStream();

                resumeChatMusicAfterVoice();


                if (
                    cancelled ||
                    blob.size ===
                        0
                ) {

                    return;

                }


                try {

                    await uploadVoice(
                        blob,
                        finalType
                    );

                }

                catch (error) {

                    console.error(
                        "Voice upload error:",
                        error
                    );

                    alert(
                        "Voice send nahi hui."
                    );

                }

            }
        );


        mediaRecorder.start();


        voiceStatus.classList.remove(
            "hidden"
        );


        voiceRecordBtn.classList.add(
            "recording"
        );


        voiceStatusText.textContent =
            "Recording...";


        voiceTimer.textContent =
            "0:00";


        updateVoiceTimer();


        voiceTimerInterval =
            setInterval(
                updateVoiceTimer,
                250
            );

    }

    catch (error) {

        console.error(
            "Microphone error:",
            error
        );


        stopVoiceStream();

        cleanupVoiceUI();

        resumeChatMusicAfterVoice();


        alert(
            "Microphone permission allow karni padegi."
        );

    }

}


// ============================================================
// STOP VOICE
// ============================================================

function stopVoiceRecording() {

    if (
        !voiceRecording ||
        !mediaRecorder
    ) {

        return;

    }


    voiceRecording =
        false;


    voiceStatusText.textContent =
        "Sending...";


    voiceRecordBtn.classList.remove(
        "recording"
    );


    if (
        mediaRecorder.state !==
        "inactive"
    ) {

        mediaRecorder.stop();

    }

}


// ============================================================
// CANCEL VOICE
// ============================================================

function cancelVoiceRecording() {

    if (
        !voiceRecording
    ) {

        return;

    }


    voiceCancelled =
        true;

    voiceRecording =
        false;


    if (
        mediaRecorder &&
        mediaRecorder.state !==
            "inactive"
    ) {

        mediaRecorder.stop();

    }


    else {

        cleanupVoiceUI();

        stopVoiceStream();

        resumeChatMusicAfterVoice();

    }

}


// ============================================================
// UPLOAD VOICE
// ============================================================

async function uploadVoice(
    blob,
    mimeType
) {

    if (
        blob.size >
        MAX_VOICE_SIZE
    ) {

        alert(
            "Voice 10MB se chhoti honi chahiye."
        );

        return;
    }


    let extension =
        "webm";


    if (
        mimeType.includes(
            "mp4"
        )
    ) {

        extension =
            "m4a";

    }

    else if (
        mimeType.includes(
            "ogg"
        )
    ) {

        extension =
            "ogg";

    }


    const fileName =
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2) +
        "." +
        extension;


    const filePath =
        "voice/" +
        fileName;


    const {
        error:
            uploadError
    } =
        await supabaseClient

            .storage

            .from(
                "chat-voice"
            )

            .upload(
                filePath,
                blob,
                {

                    cacheControl:
                        "3600",

                    contentType:
                        mimeType,

                    upsert:
                        false

                }
            );


    if (uploadError) {

        throw uploadError;

    }


    const {
        error:
            dbError
    } =
        await supabaseClient

            .from(
                "messages"
            )

            .insert({

                sender_name:
                    chatName,

                message:
                    "Voice message",

                message_type:
                    "voice",

                file_path:
                    filePath

            });


    if (dbError) {

        await supabaseClient

            .storage

            .from(
                "chat-voice"
            )

            .remove([
                filePath
            ]);


        throw dbError;

    }

}


// ============================================================
// VOICE TIMER
// ============================================================

function updateVoiceTimer() {

    if (
        !voiceStartTime
    ) {

        return;

    }


    const elapsed =
        Math.floor(

            (
                Date.now() -
                voiceStartTime
            )

            / 1000

        );


    const minutes =
        Math.floor(
            elapsed /
            60
        );


    const seconds =
        elapsed %
        60;


    voiceTimer.textContent =
        minutes +
        ":" +
        String(seconds)
            .padStart(
                2,
                "0"
            );

}


// ============================================================
// CLEAN VOICE UI
// ============================================================

function cleanupVoiceUI() {

    clearInterval(
        voiceTimerInterval
    );


    voiceTimerInterval =
        null;

    voiceRecording =
        false;

    voiceStartTime =
        null;


    voiceStatus.classList.add(
        "hidden"
    );


    voiceRecordBtn.classList.remove(
        "recording"
    );


    voiceStatusText.textContent =
        "Recording...";


    voiceTimer.textContent =
        "0:00";

}


// ============================================================
// STOP MICROPHONE STREAM
// ============================================================

function stopVoiceStream() {

    if (
        !voiceStream
    ) {

        return;

    }


    voiceStream

        .getTracks()

        .forEach(
            track => {

                track.stop();

            }
        );


    voiceStream =
        null;

}


// ============================================================
// REALTIME CHAT
// ============================================================

function startRealtimeChat() {

    if (
        chatChannel
    ) {

        return;

    }


    chatChannel =
        supabaseClient

            .channel(
                "prsn-private-network"
            )


            .on(

                "postgres_changes",

                {

                    event:
                        "INSERT",

                    schema:
                        "public",

                    table:
                        "messages"

                },

                async payload => {

                    await displayMessage(
                        payload.new
                    );

                }

            )


            .on(

                "postgres_changes",

                {

                    event:
                        "DELETE",

                    schema:
                        "public",

                    table:
                        "messages"

                },

                payload => {

                    const element =
                        document
                            .querySelector(
                                `[data-message-id="${payload.old.id}"]`
                            );


                    if (
                        element
                    ) {

                        element.remove();

                    }

                }

            )


            .subscribe(
                status => {

                    console.log(
                        "PRSN CHAT:",
                        status
                    );

                }
            );

}


// ============================================================
// LAST SEEN
// ============================================================

async function updateLastSeen() {

    if (
        !currentUser
    ) {

        return;

    }


    const {
        error
    } =
        await supabaseClient

            .from(
                "members"
            )

            .update({

                last_seen_at:
                    new Date()
                        .toISOString()

            })

            .eq(
                "name",
                currentUser
            );


    if (error) {

        console.error(
            "Last seen error:",
            error
        );

    }

}


// ============================================================
// LAST SEEN HEARTBEAT
// ============================================================

setInterval(
    () => {

        if (
            currentUser
        ) {

            updateLastSeen();

        }

    },
    60000
);


document.addEventListener(
    "visibilitychange",
    () => {

        if (
            !document.hidden &&
            currentUser
        ) {

            updateLastSeen();

        }

    }
);


// ============================================================
// OPEN AMAZING WALL
// ============================================================

galleryBtn.addEventListener(
    "click",
    async () => {

        dashboard.classList.remove(
            "active"
        );


        galleryScreen.classList.remove(
            "hidden"
        );


        await loadGallery();

        startRealtimeGallery();

    }
);


// ============================================================
// BACK FROM GALLERY
// ============================================================

backFromGallery.addEventListener(
    "click",
    () => {

        galleryScreen.classList.add(
            "hidden"
        );


        dashboard.classList.add(
            "active"
        );

    }
);


// ============================================================
// LOAD GALLERY
// ============================================================

async function loadGallery() {

    galleryGrid.innerHTML = `

        <div class="gallery-loading">
            LOADING PRSN ARCHIVE...
        </div>

    `;


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                "gallery_photos"
            )

            .select(
                "*"
            )

            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (error) {

        console.error(
            "Gallery load error:",
            error
        );


        galleryGrid.innerHTML = `

            <div class="gallery-loading">
                ARCHIVE COULD NOT LOAD
            </div>

        `;


        return;
    }


    galleryGrid.innerHTML =
        "";


    if (
        !data.length
    ) {

        galleryGrid.innerHTML = `

            <div class="gallery-loading">
                NO MEMORIES YET
            </div>

        `;

        return;
    }


    for (
        const photo
        of data
    ) {

        await displayGalleryPhoto(
            photo
        );

    }

}


// ============================================================
// DISPLAY GALLERY PHOTO
// ============================================================

async function displayGalleryPhoto(
    photo
) {

    if (
        document.querySelector(
            `[data-gallery-id="${photo.id}"]`
        )
    ) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient

            .storage

            .from(
                "prsn-gallery"
            )

            .createSignedUrl(
                photo.image_path,
                3600
            );


    if (
        error ||
        !data
    ) {

        console.error(
            "Gallery signed URL error:",
            error
        );

        return;
    }


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "gallery-photo-card";


    card.dataset.galleryId =
        photo.id;


    const date =
        formatGalleryDate(
            photo.created_at
        );


    card.innerHTML = `

        <div class="gallery-image-wrap">

            <img
                src="${data.signedUrl}"
                class="gallery-image"
                alt="PRSN memory"
                loading="lazy"
            >

        </div>


        <div class="gallery-info">

            <div class="gallery-uploader">

                ${escapeHTML(
                    photo.uploader_name
                )}

            </div>


            <div class="gallery-date">

                ${date}

            </div>

        </div>

    `;


    const image =
        card.querySelector(
            ".gallery-image"
        );


    image.addEventListener(
        "click",
        () => {

            window.open(
                data.signedUrl,
                "_blank"
            );

        }
    );


    galleryGrid.appendChild(
        card
    );

}


// ============================================================
// GALLERY PHOTO INPUT
// ============================================================

galleryInput.addEventListener(
    "change",
    async event => {

        const file =
            event.target
                .files[0];


        if (!file) {
            return;
        }


        if (
            !file.type
                .startsWith(
                    "image/"
                )
        ) {

            alert(
                "Sirf image upload kar."
            );

            galleryInput.value =
                "";

            return;
        }


        if (
            file.size >
            MAX_IMAGE_SIZE
        ) {

            alert(
                "Photo 5MB se chhoti honi chahiye."
            );

            galleryInput.value =
                "";

            return;
        }


        try {

            await uploadGalleryPhoto(
                file
            );


            await loadGallery();

        }

        catch (error) {

            console.error(
                "Gallery upload error:",
                error
            );


            alert(
                "Photo upload nahi hui."
            );

        }


        galleryInput.value =
            "";

    }
);


// ============================================================
// UPLOAD GALLERY PHOTO
// ============================================================

async function uploadGalleryPhoto(
    file
) {

    if (
        !currentUser
    ) {

        return;

    }


    const extension =
        (
            file.name
                .split(".")
                .pop() ||
            "jpg"
        )
            .toLowerCase();


    const fileName =
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2) +
        "." +
        extension;


    const filePath =
        "wall/" +
        fileName;


    const {
        error:
            uploadError
    } =
        await supabaseClient

            .storage

            .from(
                "prsn-gallery"
            )

            .upload(
                filePath,
                file,
                {

                    cacheControl:
                        "3600",

                    contentType:
                        file.type,

                    upsert:
                        false

                }
            );


    if (
        uploadError
    ) {

        throw uploadError;

    }


    const {
        error:
            dbError
    } =
        await supabaseClient

            .from(
                "gallery_photos"
            )

            .insert({

                uploader_name:
                    currentUser,

                image_path:
                    filePath,

                caption:
                    null

            });


    if (
        dbError
    ) {

        await supabaseClient

            .storage

            .from(
                "prsn-gallery"
            )

            .remove([
                filePath
            ]);


        throw dbError;

    }

}


// ============================================================
// REALTIME GALLERY
// ============================================================

function startRealtimeGallery() {

    if (
        galleryChannel
    ) {

        return;

    }


    galleryChannel =
        supabaseClient

            .channel(
                "prsn-archive"
            )


            .on(

                "postgres_changes",

                {

                    event:
                        "INSERT",

                    schema:
                        "public",

                    table:
                        "gallery_photos"

                },

                async payload => {

                    if (
                        galleryScreen
                            .classList
                            .contains(
                                "hidden"
                            )
                    ) {

                        return;

                    }


                    await displayGalleryPhoto(
                        payload.new
                    );

                }

            )


            .subscribe(
                status => {

                    console.log(
                        "PRSN WALL:",
                        status
                    );

                }
            );

}


// ============================================================
// DELETE MENU GLOBAL CLOSE
// ============================================================

document.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest(
                ".message-delete-btn"
            ) &&
            !event.target.closest(
                ".message-delete-menu"
            )
        ) {

            document
                .querySelectorAll(
                    ".message-delete-menu"
                )
                .forEach(
                    menu => {

                        menu
                            .classList
                            .add(
                                "hidden"
                            );

                    }
                );

        }

    }
);


// ============================================================
// ESC KEY
// ============================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        if (
            !chatModal
                .classList
                .contains(
                    "hidden"
                )
        ) {

            closeChatModal();

        }

    }
);


// ============================================================
// CURSOR GLOW
// ============================================================

function initCursorGlow() {

    if (
        !cursorGlow ||
        window.matchMedia(
            "(pointer: coarse)"
        ).matches
    ) {

        return;

    }


    let targetX =
        window.innerWidth /
        2;

    let targetY =
        window.innerHeight /
        2;

    let currentX =
        targetX;

    let currentY =
        targetY;


    window.addEventListener(
        "pointermove",
        event => {

            targetX =
                event.clientX;

            targetY =
                event.clientY;

        },
        {
            passive:
                true
        }
    );


    function animateGlow() {

        currentX +=
            (
                targetX -
                currentX
            )
            * .12;


        currentY +=
            (
                targetY -
                currentY
            )
            * .12;


        cursorGlow.style.left =
            currentX +
            "px";


        cursorGlow.style.top =
            currentY +
            "px";


        requestAnimationFrame(
            animateGlow
        );

    }


    animateGlow();

}


// ============================================================
// PREMIUM 3D CARDS
// ============================================================

function initTiltCards() {

    const cards =
        document.querySelectorAll(
            "[data-tilt]"
        );


    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    cards.forEach(
        card => {

            card.addEventListener(
                "pointermove",
                event => {

                    const rect =
                        card
                            .getBoundingClientRect();


                    const pointerX =
                        event.clientX -
                        rect.left;


                    const pointerY =
                        event.clientY -
                        rect.top;


                    const percentageX =
                        pointerX /
                        rect.width;


                    const percentageY =
                        pointerY /
                        rect.height;


                    card.style.setProperty(
                        "--mx",
                        `${percentageX * 100}%`
                    );


                    card.style.setProperty(
                        "--my",
                        `${percentageY * 100}%`
                    );


                    if (
                        reducedMotion ||
                        event.pointerType !==
                            "mouse"
                    ) {

                        return;

                    }


                    const rotateY =
                        (
                            percentageX -
                            .5
                        )
                        * 5;


                    const rotateX =
                        -(
                            percentageY -
                            .5
                        )
                        * 5;


                    const lift =
                        card.classList
                            .contains(
                                "experience-card"
                            )
                            ? -7
                            : -3;


                    card.style.transform =
                        `
                            translateY(${lift}px)
                            rotateX(${rotateX}deg)
                            rotateY(${rotateY}deg)
                        `;

                }
            );


            card.addEventListener(
                "pointerleave",
                () => {

                    card.style
                        .removeProperty(
                            "transform"
                        );


                    card.style.setProperty(
                        "--mx",
                        "70%"
                    );


                    card.style.setProperty(
                        "--my",
                        "25%"
                    );

                }
            );

        }
    );

}


// ============================================================
// MAGNETIC BUTTON EFFECT
// ============================================================

function initMagneticButtons() {

    if (
        window.matchMedia(
            "(pointer: coarse)"
        ).matches
    ) {

        return;

    }


    const buttons =
        document.querySelectorAll(
            ".luxury-btn, .experience-arrow, .gallery-upload-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "pointermove",
                event => {

                    const rect =
                        button
                            .getBoundingClientRect();


                    const x =
                        event.clientX -
                        rect.left -
                        rect.width /
                        2;


                    const y =
                        event.clientY -
                        rect.top -
                        rect.height /
                        2;


                    button.style.transform =
                        `
                            translate(
                                ${x * .05}px,
                                ${y * .05}px
                            )
                        `;

                }
            );


            button.addEventListener(
                "pointerleave",
                () => {

                    button.style
                        .removeProperty(
                            "transform"
                        );

                }
            );

        }
    );

}


// ============================================================
// INPUT VISUAL RESPONSE
// ============================================================

function initInputEffects() {

    document
        .querySelectorAll(
            ".input-shell input"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    () => {

                        const shell =
                            input.closest(
                                ".input-shell"
                            );


                        if (!shell) {
                            return;
                        }


                        shell.classList.toggle(
                            "has-value",
                            input.value.length >
                            0
                        );

                    }
                );

            }
        );

}


// ============================================================
// SUPABASE TEST
// ============================================================

async function testSupabaseConnection() {

    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                "members"
            )

            .select(
                "name"
            );


    if (error) {

        console.error(
            "PRSN SUPABASE CONNECTION FAILED:",
            error
        );

        return;

    }


    console.log(
        "✦ PRSN PRIVATE NETWORK CONNECTED",
        data
    );

}


// ============================================================
// INITIALIZE
// ============================================================

function initializePRSN() {

    initCursorGlow();

    initTiltCards();

    initMagneticButtons();

    initInputEffects();

    testSupabaseConnection();

}


// ============================================================
// START
// ============================================================

initializePRSN();