(() => {
  const study = document.querySelector('[data-feature-layout-study]');
  if (!study) return;

  const tabs = [...study.querySelectorAll('[data-feature-variant]')];
  const panels = [...study.querySelectorAll('[data-feature-variant-panel]')];
  if (!tabs.length || !panels.length) return;

  function selectVariant(name, moveFocus = false) {
    for (const tab of tabs) {
      const active = tab.dataset.featureVariant === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && moveFocus) tab.focus();
    }

    for (const panel of panels) {
      const active = panel.dataset.featureVariantPanel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectVariant(tab.dataset.featureVariant));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let targetIndex = index;
      if (event.key === 'ArrowLeft') targetIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') targetIndex = (index + 1) % tabs.length;
      if (event.key === 'Home') targetIndex = 0;
      if (event.key === 'End') targetIndex = tabs.length - 1;
      selectVariant(tabs[targetIndex].dataset.featureVariant, true);
    });
  });

  study.classList.add('is-ready');
  selectVariant(tabs.find(tab => tab.classList.contains('is-active'))?.dataset.featureVariant || tabs[0].dataset.featureVariant);
})();
