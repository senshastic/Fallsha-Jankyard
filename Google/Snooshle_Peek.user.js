// ==UserScript==
// @name         Snooshle Peek
// @namespace    Violentmonkey Scripts
// @version      3.0
// @description  Adds live previews for links in Google search results with a whoosh and bounce effect. Reddit links use the Reddit API, others use an iframe.
// @match        https://www.google.com/*
// @match        https://www.google.fr/*
// @grant        none
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

    // CSS styles for the preview box with whoosh and bounce animation
    const previewStyle = `
        #google-preview-box {
            position: absolute;
            display: none;
            width: 600px;
            height: 400px;
            border-radius: 12px;
            background-color: rgba(5, 5, 5, 0.18);
            box-shadow: 0 0px 10px rgba(255, 255, 255, 0.781);
            backdrop-filter: blur(100px) saturate(110%);
            -webkit-backdrop-filter: blur(100px);
            border: solid 1px #d0b575;
            padding: 5px;
            z-index: 10000;
            overflow-y: auto;
            opacity: 0; /* Start invisible */
            transform: scale(0.7); /* Start smaller */
            filter: blur(4px); /* Start blurry */
            animation: none; /* Default state */
        }

        #google-preview-box.bouncy-whoosh {
            animation: whooshBounce 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @keyframes whooshBounce {
            0% {
                transform: scale(0.7);
                opacity: 0;
                filter: blur(4px);
            }
            50% {
                transform: scale(1.1); /* Slight overscale for bounce effect */
                opacity: 0.9;
                filter: blur(2px);
            }
            80% {
                transform: scale(0.98); /* Bounce back slightly */
                opacity: 1;
                filter: blur(1px);
            }
            100% {
                transform: scale(1); /* Final scale */
                opacity: 1;
                filter: blur(0);
            }
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

    // Position the preview box near the cursor, ensuring it stays within the viewport
    function positionPreviewBox(event) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const previewWidth = 600; // Match CSS width
        const previewHeight = 400; // Match CSS height

        let top = event.pageY + 15; // Below the cursor
        let left = event.pageX + 15; // Right of the cursor

        // Ensure the box doesn't overflow the viewport
        if (top + previewHeight > viewportHeight + window.scrollY) {
            top = event.pageY - previewHeight - 15; // Move above the cursor
        }
        if (left + previewWidth > viewportWidth + window.scrollX) {
            left = event.pageX - previewWidth - 15; // Move to the left of the cursor
        }

        $("#google-preview-box").css({
            top: `${top}px`,
            left: `${left}px`,
        });
    }

    // Show the preview box with whoosh and bounce animation
    function showPreviewBox() {
        const previewBox = $("#google-preview-box");

        // Reset and trigger the animation
        previewBox.removeClass("bouncy-whoosh").css("display", "block");
        setTimeout(() => {
            previewBox.addClass("bouncy-whoosh");
        }, 10); // Small delay to ensure animation triggers
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
                    showPreviewBox();
                } else {
                    $("#google-preview-box").html("<p>Error fetching Reddit content.</p>");
                    showPreviewBox();
                }
            })
            .catch((error) => {
                console.error("Error fetching Reddit content:", error);
                $("#google-preview-box").html("<p>Error loading preview.</p>");
                showPreviewBox();
            });
    }

    // Display iframe preview for non-Reddit links
    function showIframePreview(url, event) {
        log("Displaying iframe preview for:", url);

        $("#google-preview-box").html(`<iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>`);

        positionPreviewBox(event);
        showPreviewBox();
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
                $("#google-preview-box").css("display", "none");
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
