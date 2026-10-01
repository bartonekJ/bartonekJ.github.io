(() => {
  const prose = document.querySelector('.update-prose');
  if (!prose) return;

  function getYouTubeId(value) {
    let candidate = null;

    try {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, '').toLowerCase();

      if (host === 'youtu.be') {
        candidate = url.pathname.split('/').filter(Boolean)[0] || null;
      }

      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (url.pathname === '/watch') candidate = url.searchParams.get('v');

        const parts = url.pathname.split('/').filter(Boolean);
        if (['shorts', 'embed', 'live'].includes(parts[0])) candidate = parts[1] || null;
      }
    } catch {
      return null;
    }

    return candidate && /^[a-zA-Z0-9_-]{6,20}$/.test(candidate) ? candidate : null;
  }

  function getStandaloneYouTubeLink(paragraph) {
    const anchors = [...paragraph.querySelectorAll('a')];

    if (anchors.length === 1 && paragraph.textContent.trim() === anchors[0].textContent.trim()) {
      const id = getYouTubeId(anchors[0].href);
      if (id) {
        return {
          id,
          url: anchors[0].href,
          label: getYouTubeId(anchors[0].textContent.trim())
            ? 'Watch on YouTube'
            : anchors[0].textContent.trim()
        };
      }
    }

    if (!anchors.length) {
      const url = paragraph.textContent.trim();
      const id = getYouTubeId(url);
      if (id) return { id, url, label: 'Watch on YouTube' };
    }

    return null;
  }

  function repairEditorWrappedMarkdownLink(paragraph) {
    const anchors = [...paragraph.querySelectorAll('a')];
    if (anchors.length !== 1) return;

    const match = paragraph.textContent.trim().match(/^\[([^\]]+)\]\((https?:\/\/.+)\)$/);
    if (!match) return;

    const link = document.createElement('a');
    link.href = anchors[0].href;
    link.textContent = match[1];
    paragraph.replaceChildren(link);
  }

  function makeVideoCard(video) {
    const figure = document.createElement('figure');
    figure.className = 'update-youtube-card';

    const link = document.createElement('a');
    link.className = 'update-youtube-link';
    link.href = video.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${video.label} (opens YouTube)`);

    const thumbnail = document.createElement('img');
    thumbnail.className = 'update-youtube-thumbnail';
    thumbnail.src = `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;
    thumbnail.alt = '';
    thumbnail.loading = 'lazy';
    const useFallbackThumbnail = () => {
      if (thumbnail.dataset.fallback) return;
      thumbnail.dataset.fallback = 'true';
      thumbnail.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
    };
    thumbnail.addEventListener('error', useFallbackThumbnail);
    thumbnail.addEventListener('load', () => {
      if (thumbnail.naturalWidth < 640) useFallbackThumbnail();
    });

    const play = document.createElement('span');
    play.className = 'update-youtube-play';
    play.setAttribute('aria-hidden', 'true');
    play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>';

    const label = document.createElement('span');
    label.className = 'update-youtube-label';
    label.textContent = video.label;

    link.append(thumbnail, play, label);
    figure.append(link);
    return figure;
  }

  [...prose.children].forEach((element) => {
    if (element.tagName !== 'P') return;
    repairEditorWrappedMarkdownLink(element);
    const video = getStandaloneYouTubeLink(element);
    if (video) element.replaceWith(makeVideoCard(video));
  });
})();
