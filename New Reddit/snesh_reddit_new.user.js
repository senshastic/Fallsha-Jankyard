// ==UserScript==
// @name        Reddit Style Modifier (Shadow DOM Targets)
// @version     2.5.1
// @namespace   Violentmonkey Scripts
// @description Styles specific elements in multiple shadow DOMs efficiently
// @match       https://www.reddit.com/*
// @grant       none
// ==/UserScript==

(function () {
    'use strict';

    console.log("🔍 Script started: Targeting all shadow DOM elements...");

    const styleText = `
               /* Original selected element */
        a.flex.justify-between.relative.px-md.gap-\\[0\\.5rem\\].text-secondary-onBackground.bg-neutral-background-selected.hover\\:bg-neutral-background-selected.hover\\:bg-neutral-background-hover.hover\\:no-underline.cursor-pointer.py-2xs.-outline-offset-1.s\\:rounded-\\[8px\\].no-underline {
            box-shadow: 0px 2px 0px 0px #FFFFFF0f,
                  0px 2px 8px 0px #00000040,
                  inset 0px 8px 8px 0px #FFFFFF07 !important;
            outline: 1px solid #ffffff10 !important;
            outline-offset: -1px !important;
            background-color: transparent !important;
        }

                /* Hover effect for non-selected items */
        a.flex.justify-between.relative.px-md.gap-\\[0\\.5rem\\].text-secondary.hover\\:text-secondary-hover.active\\:bg-interactive-pressed.hover\\:bg-neutral-background-hover.hover\\:no-underline.cursor-pointer.py-2xs.-outline-offset-1.s\\:rounded-\\[8px\\].bg-transparent.no-underline:not([rpl-selected]):hover {
            box-shadow: 0px 2px 0px 0px #FFFFFF0f,
                  0px 2px 8px 0px #00000040,
                  inset 0px 8px 8px 0px #FFFFFF07 !important;
            outline: 1px solid #ffffff10 !important;
            outline-offset: -1px !important;
            background-color: transparent !important;
        }

        /* New hover style for specific elements */
        .flex.justify-between.relative.px-md.gap-\\[0\\.5rem\\].text-secondary.hover\\:text-secondary-hover.active\\:bg-interactive-pressed.hover\\:bg-neutral-background-hover.hover\\:no-underline.cursor-pointer.py-xs.-outline-offset-1.no-underline:hover {
            box-shadow: 0px 2px 0px 0px #FFFFFF0f,
                  0px 2px 8px 0px #00000040,
                  inset 0px 8px 8px 0px #FFFFFF07 !important;
            outline: 1px solid #ffffff10 !important;
            outline-offset: -1px !important;
            background-color: transparent !important;
        }

        /* Search results container */
        .max-h-\\[calc\\(100vh-var\\(--shreddit-header-height\\)-15px-10px\\)\\].overflow-y-auto.overflow-x-hidden.m-t {
                    background-color: rgba(5, 5, 5, .30) !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(100px) saturate(110%);
        -webkit-backdrop-filter: blur(100px);
        transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        border-radius: 0 0 12px 12px !important;
        }

        /* Search bar styling */
        .reddit-search-bar {
            background: transparent !important;
            box-shadow: -5px -5px 15px rgba(255, 255, 255, 0.3),
                       5px 5px 15px rgba(0, 0, 0, 0.1),
                       inset 5px 5px 10px rgba(0, 0, 0, 0.05),
                       inset -5px -5px 10px rgba(255, 255, 255, 0.1);
            font-size: 15px;
        }

        .label-container:hover{
          background: transparent !important;
        }

        shreddit-post-share-button{
            display: none !important
        }


        .error{
        background-color: rgba(255, 5, 5, .30) !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(100px) saturate(110%);
        -webkit-backdrop-filter: blur(100px);
        transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        border-radius: 0 0 12px 12px !important;
        }

        .button-shell,
        .button {
          background-color: rgba(5, 5, 5, .18) !important;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(100px) saturate(110%);
        -webkit-backdrop-filter: blur(100px);
        transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        padding: 5px;
        }

        .button:hover{
        background-color: rgba(5, 5, 5, 0) !important;
        border-radius: 12px;
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.37);
        backdrop-filter: blur(100px) saturate(110%);
        -webkit-backdrop-filter: blur(100px);
        transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        transform: translateY(-4px);
        }


        :host {
        background-color: transparent !important;
        }
        button:hover{
            background-color: rgba(5, 5, 5, 0) !important;
        border-radius: 12px;
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.37);
        backdrop-filter: blur(100px) saturate(110%);
        -webkit-backdrop-filter: blur(100px);
        transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        transform: translateY(-4px);
        }

        button{
          background-color: rgba(5, 5, 5, .18) !important;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(100px) saturate(110%);
        -webkit-backdrop-filter: blur(100px);
        transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        padding: 5px;
        }

        .bg-neutral-background {
  background-color: transparent !important;
}
      faceplate-menu{
      background-color: rgba(5, 5, 5, .18) !important;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(100px) saturate(110%);
        -webkit-backdrop-filter: blur(100px);
        transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        padding: 5px;
      }

      #faceplate-tooltip{
      background-color: rgba(5, 5, 5, .18) !important;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(100px) saturate(110%);
        -webkit-backdrop-filter: blur(100px);
        transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        padding: 5px;
      }

    ;
    `;



    const shadowHostSelectors = [
        'left-nav-top-section',
        'reddit-search-large',
        'shreddit-post',
        'faceplate-search-input',
        'faceplate-banner',
        'faceplate-tooltip',
      'faceplate-batch',
      'shreddit-comment-tree',
      'pdp-back-button',
      'faceplate-dropdown-menu',
      'shreddit-post-overflow-menu',
      'shreddit-composer',
      'shreddit-comment',
      'faceplate-hovercard'
    ];

    function injectStylesIntoShadowRoot(shadowRoot) {
        if (!shadowRoot || shadowRoot.querySelector('style.shadow-styles')) return;

        const styleElement = document.createElement('style');
        styleElement.classList.add('shadow-styles');
        styleElement.textContent = styleText;
        shadowRoot.appendChild(styleElement);
        console.log("✅ Styles injected into shadow root", shadowRoot);
    }

    function processShadowHosts() {
        shadowHostSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(host => {
                if (host.shadowRoot) {
                    injectStylesIntoShadowRoot(host.shadowRoot);
                    host.shadowRoot.querySelectorAll('*').forEach(node => {
                        if (node.shadowRoot) {
                            injectStylesIntoShadowRoot(node.shadowRoot);
                        }
                    });
                }
            });
        });
    }

    const observer = new MutationObserver(() => {
        processShadowHosts();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    processShadowHosts();
    console.log("👀 Observer started");
})();
