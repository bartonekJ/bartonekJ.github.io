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

  function promoteStandaloneNamedLink(paragraph) {
    const anchors = [...paragraph.querySelectorAll('a')];
    if (anchors.length !== 1) return;

    const label = paragraph.textContent.trim();
    if (label !== anchors[0].textContent.trim() || getYouTubeId(anchors[0].href)) return;

    try {
      const labelUrl = new URL(label);
      if (labelUrl.protocol === 'http:' || labelUrl.protocol === 'https:') return;
    } catch {
      // A non-URL label is exactly what turns a standalone link into a button.
    }

    paragraph.classList.add('update-inline-cta-row');
    anchors[0].classList.add('button', 'button-primary', 'update-inline-cta');
  }

  function enhanceTables() {
    [...prose.querySelectorAll('table')].forEach((table) => {
      if (table.parentElement?.classList.contains('update-table-scroll')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'update-table-scroll';
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', 'Data table');
      table.before(wrapper);
      wrapper.append(table);
    });
  }

  function makeVideoEmbed(video) {
    const figure = document.createElement('figure');
    figure.className = 'update-youtube-card';

    const iframe = document.createElement('iframe');
    iframe.className = 'update-youtube-frame';
    iframe.src = `https://www.youtube-nocookie.com/embed/${video.id}?rel=0`;
    iframe.title = `${video.label} — YouTube video`;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;

    figure.append(iframe);
    return figure;
  }

  [...prose.children].forEach((element) => {
    if (element.tagName !== 'P') return;
    repairEditorWrappedMarkdownLink(element);
    const video = getStandaloneYouTubeLink(element);
    if (video) {
      element.replaceWith(makeVideoEmbed(video));
      return;
    }
    promoteStandaloneNamedLink(element);
  });

  enhanceTables();
})();
