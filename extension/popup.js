document.addEventListener('DOMContentLoaded', async () => {
  const sendBtn = document.getElementById('sendBtn');
  const serverUrlInput = document.getElementById('serverUrl');
  const videoTitleElem = document.getElementById('videoTitle');
  const videoTimeElem = document.getElementById('videoTime');
  const statusElem = document.getElementById('status');

  // Load saved server URL
  chrome.storage.local.get(['dockServerUrl'], (res) => {
    if (res.dockServerUrl) {
      serverUrlInput.value = res.dockServerUrl;
    }
  });

  serverUrlInput.addEventListener('change', () => {
    let url = serverUrlInput.value.trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(url)) url = 'http://' + url;
    serverUrlInput.value = url;
    chrome.storage.local.set({ dockServerUrl: url });
  });

  let currentVideoData = null;

  // Query active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url && tab.url.includes('youtube.com/watch')) {
    chrome.tabs.sendMessage(tab.id, { action: 'GET_YOUTUBE_INFO' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        // Fallback: extract videoId directly from tab URL
        try {
          const u = new URL(tab.url);
          const videoId = u.searchParams.get('v');
          if (videoId) {
            currentVideoData = { videoId, startSeconds: 0, title: tab.title || 'YouTube Video' };
            videoTitleElem.innerText = currentVideoData.title;
            videoTimeElem.innerText = 'Timestamp: 0s';
          } else {
            showError('Not a YouTube video page');
          }
        } catch (e) {
          showError('Cannot read tab info');
        }
      } else {
        currentVideoData = response;
        videoTitleElem.innerText = response.title || 'YouTube Video';
        const mins = Math.floor(response.startSeconds / 60);
        const secs = Math.floor(response.startSeconds % 60);
        videoTimeElem.innerText = `Timestamp: ${mins}m ${secs}s`;
      }
    });
  } else {
    showError('Open a YouTube video to send to Dock');
  }

  sendBtn.addEventListener('click', async () => {
    if (!currentVideoData || !currentVideoData.videoId) {
      statusElem.className = 'status error';
      statusElem.innerText = 'No active YouTube video found';
      return;
    }

    const serverUrl = serverUrlInput.value.trim().replace(/\/+$/, '');
    sendBtn.disabled = true;
    statusElem.className = 'status';
    statusElem.innerText = 'Sending to Dock...';

    try {
      const endpoint = `${serverUrl}/api/playback/youtube`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: currentVideoData.videoId,
          startSeconds: currentVideoData.startSeconds || 0,
          title: currentVideoData.title
        })
      });

      const data = await res.json();
      if (data.success) {
        statusElem.className = 'status success';
        statusElem.innerText = '✓ Sent to Dock!';
      } else {
        statusElem.className = 'status error';
        statusElem.innerText = `Error: ${data.error || 'Failed'}`;
      }
    } catch (err) {
      statusElem.className = 'status error';
      statusElem.innerText = `Cannot reach Dock at ${serverUrl}`;
    } finally {
      sendBtn.disabled = false;
    }
  });

  function showError(msg) {
    videoTitleElem.innerText = msg;
    videoTimeElem.innerText = '';
    sendBtn.disabled = true;
  }
});
