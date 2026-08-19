// DashMob Content Script for YouTube
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_YOUTUBE_INFO') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const videoId = urlParams.get('v');
      const videoElem = document.querySelector('video');
      const currentTime = videoElem ? videoElem.currentTime : 0;
      
      let title = document.title ? document.title.replace(/- YouTube$/i, '').trim() : '';
      const titleElem = document.querySelector('h1.ytd-watch-metadata, #title h1');
      if (titleElem && titleElem.innerText) {
        title = titleElem.innerText.trim();
      }

      sendResponse({
        success: true,
        videoId: videoId,
        startSeconds: currentTime,
        title: title || `YouTube Video (${videoId})`
      });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
    return true;
  }
});
