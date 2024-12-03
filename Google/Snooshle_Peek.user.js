// ==UserScript==
// @name         Snooshle Peek
// @namespace    Violentmonkey Scripts
// @version      2.3
// @description  Adds live previews for links in Google search results: Reddit links use the Reddit API, others use an iframe.
// @match        https://www.google.com/*
// @match        https://www.google.fr/*
// @downloadURL https://github.com/senshastic/snesh-betterer-google/raw/refs/heads/main/js/Snooshle_Peek.user.js
// @updateURL   https://github.com/senshastic/snesh-betterer-google/raw/refs/heads/main/js/Snooshle_Peek.user.js
// @icon        https://cdn.discordapp.com/emojis/1245456048383459439.webp?size=240&quality=lossless
// @grant        none
// @author       sensha
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function () {
    "use strict";

    const loggingEnabled = true;
    let hoverTimeout; // Timeout for hover delay
    let disappearanceTimeout; // Timeout for delayed hiding
    let isMouseInsidePreview = false; // Tracks if mouse is inside the preview box

    // Enable/disable debug logging
    function log(...args) {
        if (loggingEnabled) {
            console.log(...args);
        }
    }

    // CSS styles for the preview box
    const previewStyle = `
        #google-preview-box {
            position: absolute;
            display: none;
            width: 600px;
            height: 400px;
            border-radius: 12px;
            background-color: rgba(5, 5, 5, 0.18);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(100px) saturate(110%);
            border: solid 1px #d0b575;
            padding: 5px;
            z-index: 10000;
            overflow-y: auto;
            transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
            scrollbar-width: none;
        }

        #google-preview-box::-webkit-scrollbar {
            display: none;
        }

        #google-preview-box .reddit-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #ff4500;
        }

        #google-preview-box .reddit-selftext {
            margin-bottom: 15px;
            font-style: italic;
            color: #ddd;
        }

        #google-preview-box .reddit-comment {
            margin-bottom: 10px;
            padding: 8px;
            background-color: rgba(5, 5, 5, 0.18);
            border-radius: 12px;
        }

        #google-preview-box .reddit-comment-author {
            font-weight: bold;
            color: #ff8700;
        }
    `;

    // Inject the CSS styles into the page
    const styleElement = document.createElement("style");
    styleElement.textContent = previewStyle;
    document.head.appendChild(styleElement);

    // Create the preview box element
    const previewBox = document.createElement("div");
    previewBox.id = "google-preview-box";
    document.body.appendChild(previewBox);

    // Position the preview box near the cursor
    function positionPreviewBox(event) {
        $("#google-preview-box").css({
            top: event.pageY + 15 + "px",
            left: event.pageX + 15 + "px",
        });
    }

    // Fetch and display Reddit post content
    function fetchRedditContent(url, event) {
        $("#google-preview-box").html("<p>Loading Reddit comments...</p>");

        const postId = url.split("/comments/")[1]?.split("/")[0];
        if (!postId) {
            $("#google-preview-box").html("<p>Invalid Reddit URL.</p>");
            return;
        }

        const apiUrl = `https://www.reddit.com/comments/${postId}.json`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                const post = data[0]?.data?.children[0]?.data;
                const comments = data[1]?.data?.children;

                if (post) {
                    const title = post.title || "No title available";
                    const selftext = post.selftext || "No selftext available";

                    const allComments = comments
                        .map(
                            (c) => `
                                <div class="reddit-comment">
                                    <span class="reddit-comment-author">${c.data.author || "Unknown"}</span>: ${c.data.body || "[No comment text]"}
                                </div>
                            `
                        )
                        .join("");

                    $("#google-preview-box").html(`
                        <div class="reddit-title">${title}</div>
                        <div class="reddit-selftext">${selftext}</div>
                        <div class="reddit-comments"><strong>Comments:</strong>${allComments || "<p>No comments available.</p>"}</div>
                    `);

                    positionPreviewBox(event);
                    $("#google-preview-box").show();
                } else {
                    $("#google-preview-box").html("<p>Error fetching Reddit content.</p>").show();
                }
            })
            .catch((error) => {
                console.error("Error fetching Reddit content:", error);
                $("#google-preview-box").html("<p>Error loading preview.</p>").show();
            });
    }

    // Display iframe preview for non-Reddit links
    function showIframePreview(url, event) {
        log("Displaying iframe preview for:", url);

        $("#google-preview-box").html(`<iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>`);

        positionPreviewBox(event);
        $("#google-preview-box").show();
    }

    // Determine preview type based on URL
    function handlePreview(url, event) {
        if (url.includes("reddit.com")) {
            log("Using Reddit API for preview.");
            fetchRedditContent(url, event);
        } else {
            log("Using iframe preview.");
            showIframePreview(url, event);
        }
    }

    // Hide the preview box with a slight delay
    function hidePreviewWithDelay() {
        disappearanceTimeout = setTimeout(() => {
            if (!isMouseInsidePreview) {
                $("#google-preview-box").hide();
            }
        }, 1000);
    }

    // Attach hover events to links
    $(document).on("mouseover", 'a[jsname="UWckNb"]', function (event) {
        const url = $(this).attr("href");
        if (url) {
            hoverTimeout = setTimeout(() => handlePreview(url, event), 1000);
        }
    });

    $(document).on("mouseout", 'a[jsname="UWckNb"]', function () {
        clearTimeout(hoverTimeout);
        hidePreviewWithDelay();
    });

    // Keep preview visible when the mouse is inside
    $(previewBox).on("mouseover", function () {
        isMouseInsidePreview = true;
        clearTimeout(disappearanceTimeout);
    });

    $(previewBox).on("mouseout", function () {
        isMouseInsidePreview = false;
        hidePreviewWithDelay();
    });

    // Hide the preview when clicking outside
    $(document).on("click", function (event) {
        if (!$(event.target).closest("#google-preview-box").length) {
            $("#google-preview-box").hide();
        }
    });
})();
