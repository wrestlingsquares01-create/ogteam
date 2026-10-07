// ============================================================
// PRSN — THE CHAOS ROOM
// FINAL SCRIPT.JS
// Lightweight • Supabase • Realtime • Study Board
// ============================================================


// ============================================================
// 1. CONFIG
// ============================================================

const CONFIG = window.PRSN_CONFIG || {
    SUPABASE_URL:
        "https://xvvtzhqyihwgjdzdqkvx.supabase.co",

    SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_Gp8pbf7ciC-QHUhMg6lyzA_WT6UaKoB"
};


const db = window.supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_PUBLISHABLE_KEY
);


// ============================================================
// 2. PRSN SETTINGS
// ============================================================

const MEMBERS = [
    "SHYAM",
    "RAVI",
    "PRASHANT",
    "NUKS",
    "PRIYANSHU"
];

const CHAT_CODE = "BACHYO";


// Temporary frontend admin gate.
// Later Supabase Auth + RLS is better for real security.

const ADMIN_USERNAME = "PRSN_ADMIN";
const ADMIN_PASSWORD = "BACHYO_ADMIN";


const MAX_CHAT_IMAGE_SIZE =
    5 * 1024 * 1024;

const MAX_VOICE_SIZE =
    10 * 1024 * 1024;

const MAX_STUDY_IMAGE_SIZE =
    8 * 1024 * 1024;

const MAX_STUDY_VIDEO_SIZE =
    50 * 1024 * 1024;

const INITIAL_MESSAGES_LIMIT = 60;


// ============================================================
// 3. APP STATE
// ============================================================

let currentUser = null;

let chatChannel = null;
let galleryChannel = null;
let studyChannel = null;

let studyPostsCache = [];

let currentStudySubject = "ALL";
let selectedStudyMediaType = "none";

let bgMusicWasPlaying = false;


// ============================================================
// 4. VOICE STATE
// ============================================================

let mediaRecorder = null;
let voiceStream = null;
let voiceChunks = [];

let voiceRecording = false;

let voiceStartedAt = 0;
let voiceTimerInterval = null;


// ============================================================
// 5. ELEMENTS
// ============================================================

// INTRO

const introScreen =
    document.getElementById("introScreen");

const enterChaosBtn =
    document.getElementById("enterChaosBtn");


// LOGIN

const nameScreen =
    document.getElementById("nameScreen");

const loginBackBtn =
    document.getElementById("loginBackBtn");

const nameInput =
    document.getElementById("nameInput");

const enterBtn =
    document.getElementById("enterBtn");

const nameError =
    document.getElementById("nameError");


// DASHBOARD

const dashboard =
    document.getElementById("dashboard");

const currentUserElement =
    document.getElementById("currentUser");

const welcomeUser =
    document.getElementById("welcomeUser");

const musicBtn =
    document.getElementById("musicBtn");

const bgMusic =
    document.getElementById("bgMusic");


// CHAT

const chatBtn =
    document.getElementById("chatBtn");

const chatModal =
    document.getElementById("chatModal");

const closeChat =
    document.getElementById("closeChat");

const chatCode =
    document.getElementById("chatCode");

const unlockChat =
    document.getElementById("unlockChat");

const chatError =
    document.getElementById("chatError");

const chatScreen =
    document.getElementById("chatScreen");

const backFromChat =
    document.getElementById("backFromChat");

const messages =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const sendMessageBtn =
    document.getElementById("sendMessage");

const photoInput =
    document.getElementById("photoInput");


// VOICE

const voiceRecordBtn =
    document.getElementById("voiceRecordBtn");

const voiceStatus =
    document.getElementById("voiceStatus");

const voiceStatusText =
    document.getElementById("voiceStatusText");

const voiceTimer =
    document.getElementById("voiceTimer");


// GALLERY

const galleryBtn =
    document.getElementById("galleryBtn");

const galleryScreen =
    document.getElementById("galleryScreen");

const backFromGallery =
    document.getElementById("backFromGallery");

const galleryInput =
    document.getElementById("galleryInput");

const galleryGrid =
    document.getElementById("galleryGrid");


// STUDY BOARD

const studyBtn =
    document.getElementById("studyBtn");

const studyScreen =
    document.getElementById("studyScreen");

const backFromStudy =
    document.getElementById("backFromStudy");

const studyPostCount =
    document.getElementById("studyPostCount");

const studyPostsGrid =
    document.getElementById("studyPostsGrid");

const studySearchInput =
    document.getElementById("studySearchInput");

const studyUploadModal =
    document.getElementById("studyUploadModal");

const openStudyUploadBtn =
    document.getElementById("openStudyUploadBtn");

const closeStudyUpload =
    document.getElementById("closeStudyUpload");

const studySubjectSelect =
    document.getElementById("studySubjectSelect");

const studyTopicInput =
    document.getElementById("studyTopicInput");

const studyTitleInput =
    document.getElementById("studyTitleInput");

const studyTextInput =
    document.getElementById("studyTextInput");

const studyFileArea =
    document.getElementById("studyFileArea");

const studyFileInput =
    document.getElementById("studyFileInput");

const studyFileName =
    document.getElementById("studyFileName");

const publishStudyPostBtn =
    document.getElementById("publishStudyPostBtn");

const studyUploadError =
    document.getElementById("studyUploadError");


// ADMIN LOGIN

const adminLoginScreen =
    document.getElementById("adminLoginScreen");

const adminBackBtn =
    document.getElementById("adminBackBtn");

const adminUsername =
    document.getElementById("adminUsername");

const adminPassword =
    document.getElementById("adminPassword");

const adminLoginBtn =
    document.getElementById("adminLoginBtn");

const adminLoginError =
    document.getElementById("adminLoginError");


// ADMIN PANEL

const adminPanel =
    document.getElementById("adminPanel");

const adminRefreshBtn =
    document.getElementById("adminRefreshBtn");

const adminLogoutBtn =
    document.getElementById("adminLogoutBtn");

const memberCount =
    document.getElementById("memberCount");

const onlineCount =
    document.getElementById("onlineCount");

const activityCount =
    document.getElementById("activityCount");

const deletedCount =
    document.getElementById("deletedCount");

const adminStudyCount =
    document.getElementById("adminStudyCount");

const adminMembersList =
    document.getElementById("adminMembersList");

const adminActivityList =
    document.getElementById("adminActivityList");

const adminDeletedList =
    document.getElementById("adminDeletedList");

const adminMediaList =
    document.getElementById("adminMediaList");

const adminStudyList =
    document.getElementById("adminStudyList");

const activityUserFilter =
    document.getElementById("activityUserFilter");

const activityTypeFilter =
    document.getElementById("activityTypeFilter");


// EFFECTS

const cursorGlow =
    document.getElementById("cursorGlow");


// ============================================================
// 6. HELPERS
// ============================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;
}


function formatDate(value) {

    if (!value) {
        return "NEVER";
    }

    return new Date(value)
        .toLocaleString([], {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
}


function formatTime(value) {

    if (!value) {
        return "";
    }

    return new Date(value)
        .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
}


function showError(
    element,
    text
) {

    if (!element) return;

    element.textContent = text;

    setTimeout(() => {

        if (
            element.textContent === text
        ) {

            element.textContent = "";
        }

    }, 3200);
}


function showScreen(screen) {

    document
        .querySelectorAll(".screen")
        .forEach(item => {

            item.classList.remove(
                "active"
            );
        });


    screen?.classList.add(
        "active"
    );


    requestAnimationFrame(
        refreshReveals
    );
}


function randomID() {

    return (
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );
}


async function signedURL(
    bucket,
    path,
    seconds = 3600
) {

    if (!path) {
        return null;
    }


    const {
        data,
        error
    } =
        await db
            .storage
            .from(bucket)
            .createSignedUrl(
                path,
                seconds
            );


    if (error) {

        console.warn(
            "Signed URL:",
            error.message
        );

        return null;
    }


    return data?.signedUrl || null;
}


// ============================================================
// 7. INTRO → LOGIN
// ============================================================

async function openLogin() {

    enterChaosBtn.disabled = true;


    try {

        const animation =
            introScreen.animate(
                [
                    {
                        opacity: 1,
                        transform:
                            "scale(1)"
                    },

                    {
                        opacity: 0,
                        transform:
                            "scale(1.035)"
                    }
                ],
                {
                    duration: 420,
                    easing:
                        "cubic-bezier(.2,.8,.2,1)",
                    fill: "forwards"
                }
            );


        await animation.finished;

    }

    catch (_) {}


    introScreen.classList.remove(
        "active"
    );


    showScreen(
        nameScreen
    );


    nameScreen.animate(
        [
            {
                opacity: 0,
                transform:
                    "translateY(20px)"
            },

            {
                opacity: 1,
                transform:
                    "translateY(0)"
            }
        ],
        {
            duration: 420,
            easing:
                "cubic-bezier(.2,.8,.2,1)"
        }
    );


    enterChaosBtn.disabled = false;


    setTimeout(
        () => nameInput.focus(),
        150
    );
}


enterChaosBtn.addEventListener(
    "click",
    openLogin
);


// ============================================================
// 8. LOGIN BACK
// ============================================================

loginBackBtn.addEventListener(
    "click",
    () => {

        nameScreen.classList.remove(
            "active"
        );


        introScreen.classList.add(
            "active"
        );


        introScreen.animate(
            [
                {
                    opacity: 0
                },
                {
                    opacity: 1
                }
            ],
            {
                duration: 350,
                easing: "ease-out"
            }
        );
    }
);


// ============================================================
// 9. MEMBER LOGIN
// ============================================================

async function enterPRSN() {

    const typed =
        nameInput.value
            .trim()
            .toUpperCase();


    nameError.textContent = "";


    // ADMIN ROUTE

    if (
        typed === "ADMIN"
    ) {

        nameInput.value = "";

        openAdminLogin();

        return;
    }


    if (!typed) {

        showError(
            nameError,
            "TYPE YOUR NAME."
        );

        return;
    }


    if (
        !MEMBERS.includes(typed)
    ) {

        showError(
            nameError,
            "YOU'RE NOT ON THE LIST."
        );

        return;
    }


    currentUser = typed;


    currentUserElement.textContent =
        currentUser;


    welcomeUser.textContent =
        currentUser;


    showScreen(
        dashboard
    );


    await startMusic();

    await updateLastSeen();

    await logActivity(
        "LOGIN",
        "PRSN"
    );
}


enterBtn.addEventListener(
    "click",
    enterPRSN
);


nameInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            enterPRSN();
        }
    }
);


// ============================================================
// 10. MUSIC
// ============================================================

async function startMusic() {

    if (!bgMusic) return;


    bgMusic.volume = 0.26;


    try {

        await bgMusic.play();

        musicBtn.textContent = "♫";

    }

    catch (_) {}
}


musicBtn.addEventListener(
    "click",
    async () => {

        if (!bgMusic) return;


        if (bgMusic.paused) {

            try {

                await bgMusic.play();

                musicBtn.textContent =
                    "♫";

            }

            catch (_) {}

        }

        else {

            bgMusic.pause();

            musicBtn.textContent =
                "♪";
        }
    }
);


// ============================================================
// IMPORTANT:
//
// Community Chat mein same bgMusic continue hota hai.
// Yahan music pause / restart nahi hota.
// ============================================================


// ============================================================
// 11. LAST SEEN
// ============================================================

async function updateLastSeen() {

    if (!currentUser) {
        return;
    }


    const timestamp =
        new Date().toISOString();


    const {
        data,
        error
    } =
        await db
            .from("members")
            .update({
                last_seen_at:
                    timestamp
            })
            .eq(
                "name",
                currentUser
            )
            .select("name");


    if (error) {

        console.warn(
            "Last seen update:",
            error.message
        );

        return;
    }


    // New member missing from members table?
    // Try inserting automatically.

    if (
        Array.isArray(data) &&
        data.length === 0
    ) {

        const {
            error:
                insertError
        } =
            await db
                .from("members")
                .insert({
                    name:
                        currentUser,

                    last_seen_at:
                        timestamp
                });


        if (insertError) {

            console.warn(
                "Member insert:",
                insertError.message
            );
        }
    }
}


setInterval(() => {

    if (currentUser) {

        updateLastSeen();
    }

}, 60000);


document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
                "visible" &&
            currentUser
        ) {

            updateLastSeen();
        }
    }
);


// ============================================================
// 12. ACTIVITY LOGS
// ============================================================

async function logActivity(
    action,
    section
) {

    if (!currentUser) {
        return;
    }


    const {
        error
    } =
        await db
            .from("activity_logs")
            .insert({
                user_name:
                    currentUser,

                action,

                section,

                created_at:
                    new Date()
                        .toISOString()
            });


    if (error) {

        console.warn(
            "Activity logging:",
            error.message
        );
    }
}


// ============================================================
// 13. CHAT MODAL
// ============================================================

chatBtn.addEventListener(
    "click",
    async () => {

        chatModal.classList.remove(
            "hidden"
        );


        chatCode.value = "";
        chatError.textContent = "";


        await logActivity(
            "OPENED_CHAT",
            "COMMUNITY_CHAT"
        );


        setTimeout(
            () => chatCode.focus(),
            100
        );
    }
);


function closeChatModal() {

    chatModal.classList.add(
        "hidden"
    );

    chatCode.value = "";
    chatError.textContent = "";
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
// 14. UNLOCK CHAT
// ============================================================

async function unlockPrivateChat() {

    const code =
        chatCode.value
            .trim()
            .toUpperCase();


    if (
        code !== CHAT_CODE
    ) {

        showError(
            chatError,
            "WRONG CODEWORD."
        );

        return;
    }


    closeChatModal();


    // MUSIC KEEPS PLAYING.
    // NO PAUSE. NO RESTART.


    chatScreen.classList.remove(
        "hidden"
    );


    await loadMessages();

    startRealtimeChat();


    setTimeout(
        () => messageInput.focus(),
        120
    );
}


unlockChat.addEventListener(
    "click",
    unlockPrivateChat
);


chatCode.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            unlockPrivateChat();
        }
    }
);


// ============================================================
// 15. BACK FROM CHAT
// ============================================================

backFromChat.addEventListener(
    "click",
    () => {

        if (voiceRecording) {

            stopVoiceRecording();
        }


        chatScreen.classList.add(
            "hidden"
        );


        // Music continues.
    }
);


// ============================================================
// 16. LOAD MESSAGES
// ============================================================

async function loadMessages() {

    messages.innerHTML = `

        <div class="gallery-loading">
            LOADING CHAT...
        </div>

    `;


    const {
        data,
        error
    } =
        await db
            .from("messages")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(
                INITIAL_MESSAGES_LIMIT
            );


    if (error) {

        console.error(error);

        messages.innerHTML = `

            <div class="gallery-loading">
                CHAT UNAVAILABLE
            </div>

        `;

        return;
    }


    const ordered =
        [...data].reverse();


    const rendered =
        await Promise.all(
            ordered.map(
                createMessageElement
            )
        );


    messages.innerHTML = "";


    const fragment =
        document.createDocumentFragment();


    rendered.forEach(item => {

        if (item) {

            fragment.appendChild(item);
        }
    });


    messages.appendChild(
        fragment
    );


    requestAnimationFrame(
        scrollChatBottom
    );
}


function scrollChatBottom() {

    messages.scrollTop =
        messages.scrollHeight;
}


// ============================================================
// 17. CREATE MESSAGE ELEMENT
// ============================================================

async function createMessageElement(
    message
) {

    const element =
        document.createElement(
            "div"
        );


    const mine =
        message.sender_name ===
        currentUser;


    element.className =
        mine
            ? "message mine"
            : "message";


    element.dataset.messageId =
        message.id;


    let content = "";


    // IMAGE

    if (
        message.message_type ===
            "image" &&
        message.file_path
    ) {

        const url =
            await signedURL(
                "chat-images",
                message.file_path
            );


        if (url) {

            content = `

                <img
                    class="message-image"
                    src="${url}"
                    loading="lazy"
                    alt="Shared photo"
                >

            `;

        }

        else {

            content = `

                <div class="message-text">
                    PHOTO UNAVAILABLE
                </div>

            `;
        }
    }


    // VOICE

    else if (
        message.message_type ===
            "voice" &&
        message.file_path
    ) {

        const url =
            await signedURL(
                "chat-voice",
                message.file_path
            );


        if (url) {

            content = `

                <div class="voice-message">

                    <div class="voice-message-icon">
                        ◉
                    </div>

                    <audio
                        class="voice-audio"
                        controls
                        preload="metadata"
                        src="${url}"
                    ></audio>

                </div>

            `;

        }

        else {

            content = `

                <div class="message-text">
                    VOICE UNAVAILABLE
                </div>

            `;
        }
    }


    // TEXT

    else {

        content = `

            <div class="message-text">
                ${escapeHTML(
                    message.message
                )}
            </div>

        `;
    }


    const deleteMenu =
        mine
            ? `

                <button
                    class="message-delete-btn"
                    type="button"
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

            `
            : "";


    element.innerHTML = `

        <div class="message-top-row">

            <div class="message-name">

                ${escapeHTML(
                    message.sender_name
                )}

            </div>

            ${deleteMenu}

        </div>

        ${content}

        <div class="message-time">

            ${formatTime(
                message.created_at
            )}

        </div>

    `;


    // IMAGE OPEN

    element
        .querySelector(
            ".message-image"
        )
        ?.addEventListener(
            "click",
            event => {

                window.open(
                    event.currentTarget.src,
                    "_blank"
                );
            }
        );


    // VOICE MUSIC DUCKING

    const audio =
        element.querySelector(
            ".voice-audio"
        );


    if (audio) {

        audio.addEventListener(
            "play",
            pauseMusicForVoice
        );


        audio.addEventListener(
            "pause",
            () => {

                if (
                    audio.currentTime <
                    audio.duration
                ) {

                    resumeMusicAfterVoice();
                }
            }
        );


        audio.addEventListener(
            "ended",
            resumeMusicAfterVoice
        );
    }


    // DELETE

    const menuButton =
        element.querySelector(
            ".message-delete-btn"
        );

    const menu =
        element.querySelector(
            ".message-delete-menu"
        );

    const deleteButton =
        element.querySelector(
            ".delete-action"
        );


    if (
        menuButton &&
        menu &&
        deleteButton
    ) {

        menuButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                document
                    .querySelectorAll(
                        ".message-delete-menu"
                    )
                    .forEach(item => {

                        item.classList.add(
                            "hidden"
                        );
                    });


                menu.classList.toggle(
                    "hidden"
                );
            }
        );


        deleteButton.addEventListener(
            "click",
            async event => {

                event.stopPropagation();


                menu.classList.add(
                    "hidden"
                );


                if (
                    !confirm(
                        "Delete this message?"
                    )
                ) {

                    return;
                }


                await deleteMessage(
                    message
                );
            }
        );
    }


    return element;
}


// ============================================================
// 18. DISPLAY REALTIME MESSAGE
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


    messages.appendChild(
        element
    );


    scrollChatBottom();
}


// ============================================================
// 19. SEND TEXT
// ============================================================

async function sendMessage() {

    const text =
        messageInput.value.trim();


    if (
        !text ||
        !currentUser
    ) {

        return;
    }


    sendMessageBtn.disabled = true;


    const {
        error
    } =
        await db
            .from("messages")
            .insert({
                sender_name:
                    currentUser,

                message:
                    text,

                message_type:
                    "text",

                file_path:
                    null
            });


    sendMessageBtn.disabled = false;


    if (error) {

        console.error(error);

        alert(
            "Message send nahi hua."
        );

        return;
    }


    messageInput.value = "";


    await logActivity(
        "SENT_MESSAGE",
        "COMMUNITY_CHAT"
    );
}


sendMessageBtn.addEventListener(
    "click",
    sendMessage
);


messageInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);


// ============================================================
// 20. CHAT IMAGE
// ============================================================

photoInput.addEventListener(
    "change",
    async event => {

        const file =
            event.target.files?.[0];


        if (!file) return;


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Image file select kar."
            );

            photoInput.value = "";

            return;
        }


        if (
            file.size >
            MAX_CHAT_IMAGE_SIZE
        ) {

            alert(
                "Photo 5MB se chhoti honi chahiye."
            );

            photoInput.value = "";

            return;
        }


        try {

            const extension =
                (
                    file.name
                        .split(".")
                        .pop() ||
                    "jpg"
                )
                    .toLowerCase();


            const path =
                "chat/" +
                randomID() +
                "." +
                extension;


            const {
                error:
                    uploadError
            } =
                await db
                    .storage
                    .from(
                        "chat-images"
                    )
                    .upload(
                        path,
                        file,
                        {
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
                    insertError
            } =
                await db
                    .from("messages")
                    .insert({
                        sender_name:
                            currentUser,

                        message:
                            "Photo",

                        message_type:
                            "image",

                        file_path:
                            path
                    });


            if (insertError) {

                await db
                    .storage
                    .from(
                        "chat-images"
                    )
                    .remove([path]);


                throw insertError;
            }


            await logActivity(
                "SENT_PHOTO",
                "COMMUNITY_CHAT"
            );

        }

        catch (error) {

            console.error(error);

            alert(
                "Photo upload nahi hui."
            );
        }


        photoInput.value = "";
    }
);


// ============================================================
// 21. MESSAGE DELETE ARCHIVE
// ============================================================

async function archiveDeletedMessage(
    message
) {

    const {
        error
    } =
        await db
            .from(
                "deleted_messages"
            )
            .insert({
                original_message_id:
                    message.id,

                sender_name:
                    message.sender_name,

                message:
                    message.message,

                message_type:
                    message.message_type,

                file_path:
                    message.file_path,

                original_created_at:
                    message.created_at,

                deleted_at:
                    new Date()
                        .toISOString(),

                deleted_by:
                    currentUser
            });


    if (error) {

        console.error(
            "Archive:",
            error
        );

        return false;
    }


    return true;
}


async function deleteMessage(
    message
) {

    if (
        message.sender_name !==
        currentUser
    ) {

        return;
    }


    const archived =
        await archiveDeletedMessage(
            message
        );


    if (!archived) {

        alert(
            "Archive system ready nahi hai, isliye message safely delete nahi kiya."
        );

        return;
    }


    const {
        error
    } =
        await db
            .from("messages")
            .delete()
            .eq(
                "id",
                message.id
            );


    if (error) {

        console.error(error);

        alert(
            "Message delete nahi hua."
        );

        return;
    }


    document
        .querySelector(
            `[data-message-id="${message.id}"]`
        )
        ?.remove();


    await logActivity(
        "DELETED_MESSAGE",
        "COMMUNITY_CHAT"
    );
}


// ============================================================
// 22. REALTIME CHAT
// ============================================================

function startRealtimeChat() {

    if (chatChannel) {
        return;
    }


    chatChannel =
        db
            .channel(
                "prsn-chat-live"
            )


            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages"
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
                    event: "DELETE",
                    schema: "public",
                    table: "messages"
                },

                payload => {

                    document
                        .querySelector(
                            `[data-message-id="${payload.old.id}"]`
                        )
                        ?.remove();
                }
            )


            .subscribe();
}


// ============================================================
// 23. CLOSE DELETE MENUS
// ============================================================

document.addEventListener(
    "click",
    event => {

        if (
            event.target.closest(
                ".message-delete-btn"
            ) ||
            event.target.closest(
                ".message-delete-menu"
            )
        ) {

            return;
        }


        document
            .querySelectorAll(
                ".message-delete-menu"
            )
            .forEach(item => {

                item.classList.add(
                    "hidden"
                );
            });
    }
);


// ============================================================
// 24. VOICE MUSIC HELPERS
// ============================================================

function pauseMusicForVoice() {

    if (!bgMusic) return;


    bgMusicWasPlaying =
        !bgMusic.paused;


    if (bgMusicWasPlaying) {

        bgMusic.pause();
    }
}


async function resumeMusicAfterVoice() {

    if (
        bgMusic &&
        bgMusicWasPlaying
    ) {

        try {

            await bgMusic.play();

        }

        catch (_) {}
    }


    bgMusicWasPlaying = false;
}


// ============================================================
// 25. VOICE RECORDING
// ============================================================

voiceRecordBtn.addEventListener(
    "pointerdown",
    async event => {

        event.preventDefault();


        try {

            voiceRecordBtn
                .setPointerCapture(
                    event.pointerId
                );

        }

        catch (_) {}


        await startVoiceRecording();
    }
);


voiceRecordBtn.addEventListener(
    "pointerup",
    stopVoiceRecording
);


voiceRecordBtn.addEventListener(
    "pointercancel",
    stopVoiceRecording
);


voiceRecordBtn.addEventListener(
    "contextmenu",
    event =>
        event.preventDefault()
);


async function startVoiceRecording() {

    if (
        voiceRecording ||
        !currentUser
    ) {

        return;
    }


    if (
        !navigator.mediaDevices
            ?.getUserMedia ||
        typeof MediaRecorder ===
            "undefined"
    ) {

        alert(
            "Voice recording supported nahi hai."
        );

        return;
    }


    pauseMusicForVoice();


    try {

        voiceStream =
            await navigator
                .mediaDevices
                .getUserMedia({
                    audio: true
                });


        let mimeType =
            "audio/webm";


        if (
            MediaRecorder.isTypeSupported(
                "audio/webm;codecs=opus"
            )
        ) {

            mimeType =
                "audio/webm;codecs=opus";
        }


        else if (
            MediaRecorder.isTypeSupported(
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


        voiceChunks = [];

        voiceRecording = true;

        voiceStartedAt =
            Date.now();


        mediaRecorder.addEventListener(
            "dataavailable",
            event => {

                if (
                    event.data?.size
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

                const type =
                    mediaRecorder.mimeType ||
                    mimeType;


                const blob =
                    new Blob(
                        voiceChunks,
                        {
                            type
                        }
                    );


                cleanVoiceUI();

                stopVoiceStream();

                await resumeMusicAfterVoice();


                if (!blob.size) {
                    return;
                }


                try {

                    await uploadVoice(
                        blob,
                        type
                    );

                }

                catch (error) {

                    console.error(error);

                    alert(
                        "Voice message send nahi hua."
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


        updateVoiceTimer();


        voiceTimerInterval =
            setInterval(
                updateVoiceTimer,
                250
            );

    }

    catch (error) {

        console.error(error);

        stopVoiceStream();

        cleanVoiceUI();

        await resumeMusicAfterVoice();


        alert(
            "Microphone permission allow kar."
        );
    }
}


function stopVoiceRecording() {

    if (
        !voiceRecording ||
        !mediaRecorder
    ) {

        return;
    }


    voiceRecording = false;


    voiceStatusText.textContent =
        "Sending...";


    if (
        mediaRecorder.state !==
        "inactive"
    ) {

        mediaRecorder.stop();
    }
}


function updateVoiceTimer() {

    const seconds =
        Math.floor(
            (
                Date.now() -
                voiceStartedAt
            ) /
            1000
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        seconds % 60;


    voiceTimer.textContent =
        `${minutes}:${String(
            remaining
        ).padStart(2, "0")}`;
}


function cleanVoiceUI() {

    clearInterval(
        voiceTimerInterval
    );


    voiceTimerInterval = null;

    voiceRecording = false;

    voiceStartedAt = 0;


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


function stopVoiceStream() {

    voiceStream
        ?.getTracks()
        .forEach(
            track => track.stop()
        );


    voiceStream = null;
}


// ============================================================
// 26. UPLOAD VOICE
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


    const extension =
        mimeType.includes("mp4")
            ? "m4a"
            : "webm";


    const path =
        "voice/" +
        randomID() +
        "." +
        extension;


    const {
        error:
            uploadError
    } =
        await db
            .storage
            .from("chat-voice")
            .upload(
                path,
                blob,
                {
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
            insertError
    } =
        await db
            .from("messages")
            .insert({
                sender_name:
                    currentUser,

                message:
                    "Voice message",

                message_type:
                    "voice",

                file_path:
                    path
            });


    if (insertError) {

        await db
            .storage
            .from(
                "chat-voice"
            )
            .remove([path]);


        throw insertError;
    }


    await logActivity(
        "SENT_VOICE",
        "COMMUNITY_CHAT"
    );
}


// ============================================================
// 27. AMAZING WALL
// ============================================================

galleryBtn.addEventListener(
    "click",
    async () => {

        galleryScreen.classList.remove(
            "hidden"
        );


        await logActivity(
            "OPENED_GALLERY",
            "AMAZING_WALL"
        );


        await loadGallery();

        startRealtimeGallery();
    }
);


backFromGallery.addEventListener(
    "click",
    () => {

        galleryScreen.classList.add(
            "hidden"
        );
    }
);


// ============================================================
// 28. LOAD GALLERY
// ============================================================

async function loadGallery() {

    galleryGrid.innerHTML = `

        <div class="gallery-loading">
            LOADING MEMORIES...
        </div>

    `;


    const {
        data,
        error
    } =
        await db
            .from(
                "gallery_photos"
            )
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        galleryGrid.innerHTML = `

            <div class="gallery-loading">
                WALL UNAVAILABLE
            </div>

        `;

        return;
    }


    galleryGrid.innerHTML = "";


    if (!data.length) {

        galleryGrid.innerHTML = `

            <div class="empty-state">

                <span>◫</span>

                <strong>
                    NO MEMORIES YET
                </strong>

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
// 29. DISPLAY GALLERY PHOTO
// ============================================================

async function displayGalleryPhoto(
    photo,
    prepend = false
) {

    if (
        document.querySelector(
            `[data-gallery-id="${photo.id}"]`
        )
    ) {

        return;
    }


    const url =
        await signedURL(
            "prsn-gallery",
            photo.image_path
        );


    if (!url) return;


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "gallery-photo-card";


    card.dataset.galleryId =
        photo.id;


    card.innerHTML = `

        <div class="gallery-image-wrap">

            <img
                src="${url}"
                class="gallery-image"
                loading="lazy"
                alt="PRSN memory"
            >

        </div>

        <div class="gallery-info">

            <span class="gallery-uploader">

                ${escapeHTML(
                    photo.uploader_name
                )}

            </span>

            <span class="gallery-date">

                ${escapeHTML(
                    formatDate(
                        photo.created_at
                    )
                )}

            </span>

        </div>

    `;


    card
        .querySelector(
            ".gallery-image"
        )
        .addEventListener(
            "click",
            () =>
                window.open(
                    url,
                    "_blank"
                )
        );


    if (prepend) {

        galleryGrid.prepend(
            card
        );

    }

    else {

        galleryGrid.appendChild(
            card
        );
    }
}


// ============================================================
// 30. GALLERY UPLOAD
// ============================================================

galleryInput.addEventListener(
    "change",
    async event => {

        const file =
            event.target.files?.[0];


        if (!file) return;


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Image file select kar."
            );

            galleryInput.value = "";

            return;
        }


        if (
            file.size >
            MAX_CHAT_IMAGE_SIZE
        ) {

            alert(
                "Photo 5MB se chhoti honi chahiye."
            );

            galleryInput.value = "";

            return;
        }


        try {

            const extension =
                (
                    file.name
                        .split(".")
                        .pop() ||
                    "jpg"
                )
                    .toLowerCase();


            const path =
                "wall/" +
                randomID() +
                "." +
                extension;


            const {
                error:
                    uploadError
            } =
                await db
                    .storage
                    .from(
                        "prsn-gallery"
                    )
                    .upload(
                        path,
                        file,
                        {
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
                    insertError
            } =
                await db
                    .from(
                        "gallery_photos"
                    )
                    .insert({
                        uploader_name:
                            currentUser,

                        image_path:
                            path,

                        caption:
                            null
                    });


            if (insertError) {

                await db
                    .storage
                    .from(
                        "prsn-gallery"
                    )
                    .remove([path]);


                throw insertError;
            }


            await logActivity(
                "SENT_PHOTO",
                "AMAZING_WALL"
            );

        }

        catch (error) {

            console.error(error);

            alert(
                "Memory upload nahi hui."
            );
        }


        galleryInput.value = "";
    }
);


// ============================================================
// 31. REALTIME GALLERY
// ============================================================

function startRealtimeGallery() {

    if (galleryChannel) {
        return;
    }


    galleryChannel =
        db
            .channel(
                "prsn-gallery-live"
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table:
                        "gallery_photos"
                },

                async payload => {

                    if (
                        !galleryScreen
                            .classList
                            .contains(
                                "hidden"
                            )
                    ) {

                        await displayGalleryPhoto(
                            payload.new,
                            true
                        );
                    }
                }
            )
            .subscribe();
}


// ============================================================
// 32. STUDY BOARD OPEN
// ============================================================

studyBtn.addEventListener(
    "click",
    async () => {

        studyScreen.classList.remove(
            "hidden"
        );


        await logActivity(
            "OPENED_STUDY",
            "STUDY_BOARD"
        );


        await loadStudyPosts();

        startRealtimeStudy();
    }
);


backFromStudy.addEventListener(
    "click",
    () => {

        studyScreen.classList.add(
            "hidden"
        );
    }
);


// ============================================================
// 33. LOAD STUDY POSTS
// ============================================================

async function loadStudyPosts() {

    studyPostsGrid.innerHTML = `

        <div class="empty-state">

            <span>✎</span>

            <strong>
                LOADING STUDY BOARD...
            </strong>

        </div>

    `;


    const {
        data,
        error
    } =
        await db
            .from("study_posts")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.warn(
            "Study Board:",
            error.message
        );


        studyPostsGrid.innerHTML = `

            <div class="empty-state">

                <span>!</span>

                <strong>
                    STUDY BOARD DATABASE
                    NOT READY
                </strong>

            </div>

        `;


        studyPostCount.textContent =
            "0";


        return;
    }


    studyPostsCache =
        data || [];


    studyPostCount.textContent =
        studyPostsCache.length;


    renderStudyPosts();
}


// ============================================================
// 34. STUDY FILTERS
// ============================================================

document
    .querySelectorAll(
        ".subject-tab"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".subject-tab"
                    )
                    .forEach(tab => {

                        tab.classList.remove(
                            "active"
                        );
                    });


                button.classList.add(
                    "active"
                );


                currentStudySubject =
                    button.dataset.subject;


                renderStudyPosts();
            }
        );
    });


studySearchInput.addEventListener(
    "input",
    renderStudyPosts
);


document
    .querySelectorAll(
        "#recentTopics button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                studySearchInput.value =
                    button.dataset.topic ||
                    button.textContent.trim();


                renderStudyPosts();
            }
        );
    });


// ============================================================
// 35. RENDER STUDY POSTS
// ============================================================

async function renderStudyPosts() {

    const query =
        studySearchInput.value
            .trim()
            .toUpperCase();


    const filtered =
        studyPostsCache.filter(
            post => {

                const subjectMatch =
                    currentStudySubject ===
                        "ALL" ||
                    post.subject ===
                        currentStudySubject;


                const text =
                    [
                        post.subject,
                        post.topic,
                        post.title,
                        post.notes,
                        post.uploader_name
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toUpperCase();


                const searchMatch =
                    !query ||
                    text.includes(query);


                return (
                    subjectMatch &&
                    searchMatch
                );
            }
        );


    if (!filtered.length) {

        studyPostsGrid.innerHTML = `

            <div class="empty-state">

                <span>✎</span>

                <strong>
                    NO STUDY POSTS FOUND
                </strong>

            </div>

        `;

        return;
    }


    studyPostsGrid.innerHTML = "";


    const cards =
        await Promise.all(
            filtered.map(
                createStudyPostCard
            )
        );


    cards.forEach(card => {

        if (card) {

            studyPostsGrid.appendChild(
                card
            );
        }
    });
}


// ============================================================
// 36. CREATE STUDY CARD
// ============================================================

async function createStudyPostCard(
    post
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "study-post-card";


    card.dataset.studyId =
        post.id;


    let mediaHTML = "";


    if (
        post.media_type ===
            "image" &&
        post.file_path
    ) {

        const url =
            await signedURL(
                "study-board",
                post.file_path
            );


        if (url) {

            mediaHTML = `

                <div class="study-post-media">

                    <img
                        src="${url}"
                        loading="lazy"
                        alt="Study material"
                    >

                </div>

            `;
        }
    }


    else if (
        post.media_type ===
            "video" &&
        post.file_path
    ) {

        const url =
            await signedURL(
                "study-board",
                post.file_path
            );


        if (url) {

            mediaHTML = `

                <div class="study-post-media">

                    <video
                        controls
                        preload="metadata"
                        src="${url}"
                    ></video>

                </div>

            `;
        }
    }


    const notes =
        post.notes
            ? `

                <p class="study-post-text">

                    ${escapeHTML(
                        post.notes
                    )}

                </p>

            `
            : "";


    card.innerHTML = `

        ${mediaHTML}

        <div class="study-post-content">

            <div class="study-post-meta">

                <span class="study-post-subject">

                    ${escapeHTML(
                        post.subject
                    )}

                </span>

                <span class="study-post-author">

                    BY
                    ${escapeHTML(
                        post.uploader_name
                    )}

                </span>

            </div>


            <div class="study-post-topic">

                ${escapeHTML(
                    post.topic
                )}

            </div>


            <h3 class="study-post-title">

                ${escapeHTML(
                    post.title
                )}

            </h3>


            ${notes}


            <span class="study-post-date">

                ${escapeHTML(
                    formatDate(
                        post.created_at
                    )
                )}

            </span>

        </div>

    `;


    return card;
}


// ============================================================
// 37. OPEN STUDY UPLOAD
// ============================================================

openStudyUploadBtn.addEventListener(
    "click",
    () => {

        if (!currentUser) return;


        resetStudyForm();


        studyUploadModal.classList.remove(
            "hidden"
        );


        setTimeout(
            () =>
                studySubjectSelect.focus(),
            100
        );
    }
);


closeStudyUpload.addEventListener(
    "click",
    () => {

        studyUploadModal.classList.add(
            "hidden"
        );
    }
);


studyUploadModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            studyUploadModal
        ) {

            studyUploadModal.classList.add(
                "hidden"
            );
        }
    }
);


// ============================================================
// 38. STUDY MEDIA TYPE
// ============================================================

document
    .querySelectorAll(
        ".media-type-btn"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".media-type-btn"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );
                    });


                button.classList.add(
                    "active"
                );


                selectedStudyMediaType =
                    button.dataset.studyType;


                studyFileInput.value = "";

                studyFileName.textContent =
                    "No file selected";


                if (
                    selectedStudyMediaType ===
                    "none"
                ) {

                    studyFileArea.classList.add(
                        "hidden"
                    );

                }

                else {

                    studyFileArea.classList.remove(
                        "hidden"
                    );


                    studyFileInput.accept =
                        selectedStudyMediaType ===
                            "image"
                            ? "image/*"
                            : "video/*";
                }
            }
        );
    });


studyFileInput.addEventListener(
    "change",
    () => {

        const file =
            studyFileInput.files?.[0];


        studyFileName.textContent =
            file
                ? file.name
                : "No file selected";
    }
);


// ============================================================
// 39. RESET STUDY FORM
// ============================================================

function resetStudyForm() {

    studySubjectSelect.value = "";
    studyTopicInput.value = "";
    studyTitleInput.value = "";
    studyTextInput.value = "";

    studyFileInput.value = "";

    studyFileName.textContent =
        "No file selected";

    studyUploadError.textContent = "";

    selectedStudyMediaType =
        "none";


    document
        .querySelectorAll(
            ".media-type-btn"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.studyType ===
                    "none"
            );
        });


    studyFileArea.classList.add(
        "hidden"
    );
}


// ============================================================
// 40. PUBLISH STUDY POST
// ============================================================

publishStudyPostBtn.addEventListener(
    "click",
    publishStudyPost
);


async function publishStudyPost() {

    if (!currentUser) return;


    const subject =
        studySubjectSelect.value
            .trim()
            .toUpperCase();


    const topic =
        studyTopicInput.value
            .trim();


    const title =
        studyTitleInput.value
            .trim();


    const notes =
        studyTextInput.value
            .trim();


    const file =
        studyFileInput.files?.[0] ||
        null;


    if (!subject) {

        showError(
            studyUploadError,
            "SELECT A SUBJECT."
        );

        return;
    }


    if (!topic) {

        showError(
            studyUploadError,
            "ENTER A TOPIC."
        );

        return;
    }


    if (!title) {

        showError(
            studyUploadError,
            "ENTER A TITLE."
        );

        return;
    }


    if (
        selectedStudyMediaType ===
            "none" &&
        !notes
    ) {

        showError(
            studyUploadError,
            "WRITE SOME NOTES."
        );

        return;
    }


    if (
        selectedStudyMediaType !==
            "none" &&
        !file
    ) {

        showError(
            studyUploadError,
            "SELECT A FILE."
        );

        return;
    }


    if (
        selectedStudyMediaType ===
            "image"
    ) {

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            showError(
                studyUploadError,
                "SELECT AN IMAGE."
            );

            return;
        }


        if (
            file.size >
            MAX_STUDY_IMAGE_SIZE
        ) {

            showError(
                studyUploadError,
                "IMAGE MAX 8MB."
            );

            return;
        }
    }


    if (
        selectedStudyMediaType ===
            "video"
    ) {

        if (
            !file.type.startsWith(
                "video/"
            )
        ) {

            showError(
                studyUploadError,
                "SELECT A VIDEO."
            );

            return;
        }


        if (
            file.size >
            MAX_STUDY_VIDEO_SIZE
        ) {

            showError(
                studyUploadError,
                "VIDEO MAX 50MB."
            );

            return;
        }
    }


    publishStudyPostBtn.disabled =
        true;


    publishStudyPostBtn
        .querySelector("span")
        .textContent =
            "UPLOADING...";


    let uploadedPath = null;


    try {

        if (
            selectedStudyMediaType !==
            "none"
        ) {

            const extension =
                (
                    file.name
                        .split(".")
                        .pop() ||
                    (
                        selectedStudyMediaType ===
                            "image"
                            ? "jpg"
                            : "mp4"
                    )
                )
                    .toLowerCase();


            uploadedPath =
                "study/" +
                subject.toLowerCase() +
                "/" +
                randomID() +
                "." +
                extension;


            const {
                error:
                    uploadError
            } =
                await db
                    .storage
                    .from(
                        "study-board"
                    )
                    .upload(
                        uploadedPath,
                        file,
                        {
                            contentType:
                                file.type,

                            cacheControl:
                                "3600",

                            upsert:
                                false
                        }
                    );


            if (uploadError) {
                throw uploadError;
            }
        }


        const {
            error:
                insertError
        } =
            await db
                .from("study_posts")
                .insert({
                    uploader_name:
                        currentUser,

                    subject,

                    topic,

                    title,

                    notes:
                        notes || null,

                    media_type:
                        selectedStudyMediaType,

                    file_path:
                        uploadedPath
                });


        if (insertError) {

            if (uploadedPath) {

                await db
                    .storage
                    .from(
                        "study-board"
                    )
                    .remove([
                        uploadedPath
                    ]);
            }


            throw insertError;
        }


        await logActivity(
            "STUDY_POST",
            "STUDY_BOARD"
        );


        studyUploadModal.classList.add(
            "hidden"
        );


        resetStudyForm();


        await loadStudyPosts();

    }

    catch (error) {

        console.error(error);


        showError(
            studyUploadError,
            "UPLOAD FAILED."
        );

    }

    finally {

        publishStudyPostBtn.disabled =
            false;


        publishStudyPostBtn
            .querySelector("span")
            .textContent =
                "PUBLISH TO STUDY BOARD";
    }
}


// ============================================================
// 41. REALTIME STUDY BOARD
// ============================================================

function startRealtimeStudy() {

    if (studyChannel) {
        return;
    }


    studyChannel =
        db
            .channel(
                "prsn-study-live"
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "study_posts"
                },

                async () => {

                    if (
                        !studyScreen
                            .classList
                            .contains(
                                "hidden"
                            )
                    ) {

                        await loadStudyPosts();
                    }
                }
            )
            .subscribe();
}


// ============================================================
// 42. ADMIN LOGIN
// ============================================================

function openAdminLogin() {

    if (
        sessionStorage.getItem(
            "prsn_admin"
        ) === "true"
    ) {

        openAdminPanel();

        return;
    }


    showScreen(
        adminLoginScreen
    );


    adminUsername.value = "";
    adminPassword.value = "";
    adminLoginError.textContent = "";


    setTimeout(
        () =>
            adminUsername.focus(),
        100
    );
}


adminBackBtn.addEventListener(
    "click",
    () => {

        showScreen(
            nameScreen
        );


        setTimeout(
            () =>
                nameInput.focus(),
            100
        );
    }
);


function loginAdmin() {

    const username =
        adminUsername.value.trim();

    const password =
        adminPassword.value;


    if (
        username !==
            ADMIN_USERNAME ||
        password !==
            ADMIN_PASSWORD
    ) {

        showError(
            adminLoginError,
            "ACCESS DENIED."
        );

        return;
    }


    sessionStorage.setItem(
        "prsn_admin",
        "true"
    );


    openAdminPanel();
}


adminLoginBtn.addEventListener(
    "click",
    loginAdmin
);


adminUsername.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            adminPassword.focus();
        }
    }
);


adminPassword.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            loginAdmin();
        }
    }
);


// ============================================================
// 43. ADMIN PANEL
// ============================================================

function openAdminPanel() {

    showScreen(
        adminPanel
    );


    loadAdminDashboard();
}


adminRefreshBtn.addEventListener(
    "click",
    loadAdminDashboard
);


adminLogoutBtn.addEventListener(
    "click",
    () => {

        sessionStorage.removeItem(
            "prsn_admin"
        );


        showScreen(
            nameScreen
        );


        nameInput.value = "";
    }
);


// ============================================================
// 44. ADMIN TABS
// ============================================================

document
    .querySelectorAll(
        ".admin-tab"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const tab =
                    button.dataset.adminTab;


                document
                    .querySelectorAll(
                        ".admin-tab"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );
                    });


                button.classList.add(
                    "active"
                );


                document
                    .querySelectorAll(
                        ".admin-section"
                    )
                    .forEach(section => {

                        section.classList.remove(
                            "active"
                        );
                    });


                document
                    .querySelector(
                        `[data-admin-section="${tab}"]`
                    )
                    ?.classList
                    .add(
                        "active"
                    );
            }
        );
    });


// ============================================================
// 45. LOAD ADMIN DASHBOARD
// ============================================================

async function loadAdminDashboard() {

    adminRefreshBtn.disabled = true;


    try {

        await Promise.all([
            loadAdminMembers(),
            loadAdminActivity(),
            loadAdminDeleted(),
            loadAdminMedia(),
            loadAdminStudy()
        ]);

    }

    finally {

        adminRefreshBtn.disabled =
            false;
    }
}


// ============================================================
// 46. ADMIN MEMBERS
// ============================================================

async function loadAdminMembers() {

    const {
        data,
        error
    } =
        await db
            .from("members")
            .select("*");


    const rows =
        error
            ? []
            : data || [];


    const memberMap =
        new Map();


    rows.forEach(row => {

        memberMap.set(
            String(row.name)
                .toUpperCase(),
            row
        );
    });


    let activeNow = 0;

    const now = Date.now();


    adminMembersList.innerHTML =
        MEMBERS.map(name => {

            const row =
                memberMap.get(name);


            const lastSeen =
                row?.last_seen_at
                    ? new Date(
                        row.last_seen_at
                    ).getTime()
                    : 0;


            const online =
                lastSeen &&
                (
                    now -
                    lastSeen
                ) <
                120000;


            if (online) {
                activeNow++;
            }


            return `

                <article
                    class="admin-member-card"
                >

                    <span
                        class="live-dot"
                        style="
                            opacity:
                            ${online ? 1 : .2};
                        "
                    ></span>


                    <strong>

                        ${escapeHTML(name)}

                    </strong>


                    <small>

                        ${
                            online
                                ? "ACTIVE NOW"
                                : (
                                    row?.last_seen_at
                                        ? "LAST SEEN " +
                                          escapeHTML(
                                              formatDate(
                                                  row.last_seen_at
                                              )
                                          )
                                        : "NO ACTIVITY YET"
                                )
                        }

                    </small>

                </article>

            `;

        }).join("");


    memberCount.textContent =
        MEMBERS.length;


    onlineCount.textContent =
        activeNow;
}


// ============================================================
// 47. ADMIN ACTIVITY
// ============================================================

let adminActivityCache = [];


async function loadAdminActivity() {

    const {
        data,
        error
    } =
        await db
            .from("activity_logs")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            )
            .limit(500);


    if (error) {

        console.warn(error);


        adminActivityCache = [];


        activityCount.textContent =
            "—";


        adminActivityList.innerHTML = `

            <div class="admin-notice">
                activity_logs table unavailable.
            </div>

        `;

        return;
    }


    adminActivityCache =
        data || [];


    activityCount.textContent =
        adminActivityCache.length;


    renderAdminActivity();
}


function renderAdminActivity() {

    const user =
        activityUserFilter.value;

    const type =
        activityTypeFilter.value;


    const filtered =
        adminActivityCache.filter(
            item => {

                return (

                    (
                        user === "ALL" ||
                        item.user_name ===
                            user
                    )

                    &&

                    (
                        type === "ALL" ||
                        item.action ===
                            type
                    )

                );
            }
        );


    if (!filtered.length) {

        adminActivityList.innerHTML = `

            <div class="admin-notice">
                No matching activity.
            </div>

        `;

        return;
    }


    adminActivityList.innerHTML =
        filtered.map(item => `

            <article
                class="admin-activity-card"
            >

                <span>
                    ●
                </span>


                <div>

                    <strong>

                        ${escapeHTML(
                            item.user_name
                        )}

                        —

                        ${escapeHTML(
                            item.action
                        )}

                    </strong>


                    <small>

                        ${escapeHTML(
                            item.section ||
                            "PRSN"
                        )}

                    </small>

                </div>


                <small>

                    ${escapeHTML(
                        formatDate(
                            item.created_at
                        )
                    )}

                </small>

            </article>

        `).join("");
}


activityUserFilter.addEventListener(
    "change",
    renderAdminActivity
);


activityTypeFilter.addEventListener(
    "change",
    renderAdminActivity
);


// ============================================================
// 48. ADMIN DELETED MESSAGES
// ============================================================

async function loadAdminDeleted() {

    const {
        data,
        error
    } =
        await db
            .from(
                "deleted_messages"
            )
            .select("*")
            .order(
                "deleted_at",
                {
                    ascending:
                        false
                }
            )
            .limit(300);


    if (error) {

        deletedCount.textContent =
            "—";


        adminDeletedList.innerHTML = `

            <div class="admin-notice">

                deleted_messages archive
                unavailable.

            </div>

        `;

        return;
    }


    deletedCount.textContent =
        data.length;


    if (!data.length) {

        adminDeletedList.innerHTML = `

            <div class="admin-notice">
                No deleted messages.
            </div>

        `;

        return;
    }


    const cards =
        await Promise.all(
            data.map(
                createDeletedAdminCard
            )
        );


    adminDeletedList.innerHTML =
        cards.join("");
}


async function createDeletedAdminCard(
    item
) {

    let preview = "";


    if (
        item.message_type ===
            "image" &&
        item.file_path
    ) {

        const url =
            await signedURL(
                "chat-images",
                item.file_path
            );


        if (url) {

            preview = `

                <img
                    src="${url}"
                    loading="lazy"
                    style="
                        width:120px;
                        height:80px;
                        object-fit:cover;
                        border:2px solid #111;
                        border-radius:8px;
                        margin-top:8px;
                    "
                    alt="Deleted image"
                >

            `;
        }
    }


    else if (
        item.message_type ===
            "voice" &&
        item.file_path
    ) {

        const url =
            await signedURL(
                "chat-voice",
                item.file_path
            );


        if (url) {

            preview = `

                <audio
                    controls
                    preload="metadata"
                    src="${url}"
                    style="
                        width:230px;
                        max-width:100%;
                        margin-top:8px;
                    "
                ></audio>

            `;
        }
    }


    else {

        preview = `

            <div
                style="
                    margin-top:6px;
                    font-size:11px;
                "
            >

                ${escapeHTML(
                    item.message || ""
                )}

            </div>

        `;
    }


    return `

        <article
            class="admin-deleted-card"
            style="
                display:block;
            "
        >

            <strong>

                ${escapeHTML(
                    item.sender_name
                )}

            </strong>


            <small>

                DELETED BY
                ${escapeHTML(
                    item.deleted_by ||
                    item.sender_name
                )}

                •

                ${escapeHTML(
                    formatDate(
                        item.deleted_at
                    )
                )}

            </small>

            ${preview}

        </article>

    `;
}


// ============================================================
// 49. ADMIN MEDIA
// ============================================================

async function loadAdminMedia() {

    const [
        galleryResult,
        chatResult
    ] =
        await Promise.all([

            db
                .from(
                    "gallery_photos"
                )
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                )
                .limit(30),

            db
                .from("messages")
                .select("*")
                .in(
                    "message_type",
                    [
                        "image",
                        "voice"
                    ]
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                )
                .limit(30)

        ]);


    const gallery =
        galleryResult.data || [];

    const chat =
        chatResult.data || [];


    const cards = [];


    for (
        const item
        of gallery
    ) {

        const url =
            await signedURL(
                "prsn-gallery",
                item.image_path
            );


        if (!url) continue;


        cards.push(`

            <article
                class="gallery-photo-card"
            >

                <div
                    class="gallery-image-wrap"
                >

                    <img
                        src="${url}"
                        loading="lazy"
                        class="gallery-image"
                        alt="Gallery media"
                    >

                </div>

                <div class="gallery-info">

                    <span
                        class="gallery-uploader"
                    >
                        ${escapeHTML(
                            item.uploader_name
                        )}
                    </span>

                    <span
                        class="gallery-date"
                    >
                        WALL
                    </span>

                </div>

            </article>

        `);
    }


    for (
        const item
        of chat
    ) {

        if (
            item.message_type ===
                "image"
        ) {

            const url =
                await signedURL(
                    "chat-images",
                    item.file_path
                );


            if (!url) continue;


            cards.push(`

                <article
                    class="gallery-photo-card"
                >

                    <div
                        class="gallery-image-wrap"
                    >

                        <img
                            src="${url}"
                            loading="lazy"
                            class="gallery-image"
                            alt="Chat image"
                        >

                    </div>

                    <div class="gallery-info">

                        <span
                            class="gallery-uploader"
                        >
                            ${escapeHTML(
                                item.sender_name
                            )}
                        </span>

                        <span
                            class="gallery-date"
                        >
                            CHAT
                        </span>

                    </div>

                </article>

            `);

        }

        else {

            const url =
                await signedURL(
                    "chat-voice",
                    item.file_path
                );


            if (!url) continue;


            cards.push(`

                <article
                    class="admin-media-card"
                    style="padding:16px;"
                >

                    <strong>

                        ${escapeHTML(
                            item.sender_name
                        )}

                    </strong>

                    <small
                        style="
                            display:block;
                            margin-top:4px;
                        "
                    >
                        VOICE MESSAGE
                    </small>

                    <audio
                        controls
                        preload="metadata"
                        src="${url}"
                        style="
                            width:100%;
                            margin-top:16px;
                        "
                    ></audio>

                </article>

            `);
        }
    }


    adminMediaList.innerHTML =
        cards.length
            ? cards.join("")
            : `

                <div class="admin-notice">
                    No media yet.
                </div>

            `;
}


// ============================================================
// 50. ADMIN STUDY UPLOADS
// ============================================================

async function loadAdminStudy() {

    const {
        data,
        error
    } =
        await db
            .from("study_posts")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            )
            .limit(100);


    if (error) {

        adminStudyCount.textContent =
            "—";


        adminStudyList.innerHTML = `

            <div class="admin-notice">
                study_posts table unavailable.
            </div>

        `;

        return;
    }


    adminStudyCount.textContent =
        data.length;


    if (!data.length) {

        adminStudyList.innerHTML = `

            <div class="admin-notice">
                No Study Board posts yet.
            </div>

        `;

        return;
    }


    const cards =
        await Promise.all(
            data.map(
                createAdminStudyCard
            )
        );


    adminStudyList.innerHTML =
        cards.join("");
}


async function createAdminStudyCard(
    post
) {

    let media = "";


    if (
        post.file_path &&
        post.media_type ===
            "image"
    ) {

        const url =
            await signedURL(
                "study-board",
                post.file_path
            );


        if (url) {

            media = `

                <img
                    src="${url}"
                    loading="lazy"
                    style="
                        width:100%;
                        aspect-ratio:16/10;
                        object-fit:cover;
                        border-bottom:
                        2px solid #111;
                    "
                    alt="Study material"
                >

            `;
        }
    }


    else if (
        post.file_path &&
        post.media_type ===
            "video"
    ) {

        const url =
            await signedURL(
                "study-board",
                post.file_path
            );


        if (url) {

            media = `

                <video
                    controls
                    preload="metadata"
                    src="${url}"
                    style="
                        width:100%;
                        aspect-ratio:16/10;
                        object-fit:cover;
                        border-bottom:
                        2px solid #111;
                    "
                ></video>

            `;
        }
    }


    return `

        <article
            class="admin-study-card"
            style="
                overflow:hidden;
            "
        >

            ${media}

            <div
                style="
                    padding:15px;
                "
            >

                <small>

                    ${escapeHTML(
                        post.subject
                    )}

                    •

                    ${escapeHTML(
                        post.topic
                    )}

                </small>


                <strong
                    style="
                        display:block;
                        margin-top:7px;
                        font-size:16px;
                    "
                >

                    ${escapeHTML(
                        post.title
                    )}

                </strong>


                <small
                    style="
                        display:block;
                        margin-top:8px;
                    "
                >

                    BY
                    ${escapeHTML(
                        post.uploader_name
                    )}

                </small>

            </div>

        </article>

    `;
}


// ============================================================
// 51. SCROLL REVEALS
// ============================================================

let revealObserver = null;


function initScrollReveal() {

    if (
        !("IntersectionObserver"
            in window)
    ) {

        document
            .querySelectorAll(
                ".reveal-section"
            )
            .forEach(item => {

                item.classList.add(
                    "is-visible"
                );
            });


        return;
    }


    revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target
                            .classList
                            .add(
                                "is-visible"
                            );


                        // One reveal only =
                        // less repeated animation work.

                        revealObserver
                            .unobserve(
                                entry.target
                            );
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin:
                    "0px 0px -4% 0px"
            }
        );


    document
        .querySelectorAll(
            ".reveal-section"
        )
        .forEach(item => {

            revealObserver.observe(
                item
            );
        });
}


function refreshReveals() {

    document
        .querySelectorAll(
            ".screen.active .reveal-section"
        )
        .forEach(item => {

            const rect =
                item.getBoundingClientRect();


            if (
                rect.top <
                window.innerHeight *
                .92
            ) {

                item.classList.add(
                    "is-visible"
                );
            }
        });
}


// ============================================================
// 52. SMOOTH FAKE 3D TILT
// ============================================================

function initTilt() {

    if (
        window.matchMedia(
            "(hover: none)"
        ).matches
    ) {

        return;
    }


    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (reducedMotion) {
        return;
    }


    document
        .querySelectorAll(
            "[data-tilt]"
        )
        .forEach(element => {

            let frame = null;


            element.addEventListener(
                "pointermove",
                event => {

                    if (frame) {
                        cancelAnimationFrame(
                            frame
                        );
                    }


                    frame =
                        requestAnimationFrame(
                            () => {

                                const rect =
                                    element
                                        .getBoundingClientRect();


                                const x =
                                    (
                                        event.clientX -
                                        rect.left
                                    ) /
                                    rect.width;


                                const y =
                                    (
                                        event.clientY -
                                        rect.top
                                    ) /
                                    rect.height;


                                const rotateY =
                                    (x - .5) * 7;


                                const rotateX =
                                    -(y - .5) * 7;


                                element.style.transform =
                                    `
                                    perspective(900px)
                                    rotateX(${rotateX}deg)
                                    rotateY(${rotateY}deg)
                                    translateY(-3px)
                                    `;

                            }
                        );
                }
            );


            element.addEventListener(
                "pointerleave",
                () => {

                    if (frame) {

                        cancelAnimationFrame(
                            frame
                        );
                    }


                    element.style
                        .removeProperty(
                            "transform"
                        );
                }
            );
        });
}


// ============================================================
// 53. MAGNETIC BUTTONS
// ============================================================

function initMagneticButtons() {

    if (
        window.matchMedia(
            "(hover: none)"
        ).matches
    ) {

        return;
    }


    document
        .querySelectorAll(
            ".magnetic"
        )
        .forEach(button => {

            button.addEventListener(
                "pointermove",
                event => {

                    const rect =
                        button
                            .getBoundingClientRect();


                    const x =
                        event.clientX -
                        (
                            rect.left +
                            rect.width / 2
                        );


                    const y =
                        event.clientY -
                        (
                            rect.top +
                            rect.height / 2
                        );


                    button.style.transform =
                        `translate(
                            ${x * .08}px,
                            ${y * .08}px
                        )`;
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
        });
}


// ============================================================
// 54. CURSOR GLOW
// ============================================================

function initCursorGlow() {

    if (
        !cursorGlow ||
        window.matchMedia(
            "(hover: none)"
        ).matches
    ) {

        return;
    }


    let mouseX =
        window.innerWidth / 2;

    let mouseY =
        window.innerHeight / 2;

    let currentX = mouseX;
    let currentY = mouseY;


    window.addEventListener(
        "pointermove",
        event => {

            mouseX =
                event.clientX;

            mouseY =
                event.clientY;
        },
        {
            passive: true
        }
    );


    function update() {

        currentX +=
            (
                mouseX -
                currentX
            ) *
            .12;


        currentY +=
            (
                mouseY -
                currentY
            ) *
            .12;


        cursorGlow.style.left =
            `${currentX}px`;


        cursorGlow.style.top =
            `${currentY}px`;


        requestAnimationFrame(
            update
        );
    }


    update();
}


// ============================================================
// 55. ESCAPE KEY
// ============================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {

            return;
        }


        if (
            !studyUploadModal
                .classList
                .contains(
                    "hidden"
                )
        ) {

            studyUploadModal
                .classList
                .add(
                    "hidden"
                );

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
// 56. SUPABASE CONNECTION TEST
// ============================================================

async function testSupabase() {

    const {
        error
    } =
        await db
            .from("members")
            .select("name")
            .limit(1);


    if (error) {

        console.warn(
            "PRSN connection:",
            error.message
        );

    }

    else {

        console.log(
            "✓ PRSN connected to Supabase"
        );
    }
}


// ============================================================
// 57. INITIALIZE
// ============================================================

function initializePRSN() {

    initScrollReveal();

    initTilt();

    initMagneticButtons();

    initCursorGlow();

    testSupabase();
}


initializePRSN();
