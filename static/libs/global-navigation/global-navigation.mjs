/* eslint-disable no-console */


const MILO_TEMPLATES = [
  '404',
  'featured-story',
];
const MILO_BLOCKS = [
  'accordion',
  'action-item',
  'action-scroller',
  'adobetv',
  'article-feed',
  'article-header',
  'aside',
  'author-header',
  'brick',
  'bulk-publish',
  'bulk-publish-v2',
  'caas',
  'caas-config',
  'caas-marquee',
  'caas-marquee-metadata',
  'card',
  'card-horizontal',
  'card-metadata',
  'carousel',
  'chart',
  'columns',
  'faas',
  'featured-article',
  'figure',
  'form',
  'fragment',
  'featured-article',
  'global-footer',
  'global-navigation',
  'graybox',
  'footer',
  'gnav',
  'how-to',
  'icon-block',
  'iframe',
  'instagram',
  'marketo',
  'marquee',
  'marquee-anchors',
  'martech-metadata',
  'media',
  'merch',
  'merch-card',
  'merch-card-collection',
  'merch-offers',
  'mnemonic-list',
  'mobile-app-banner',
  'modal',
  'modal-metadata',
  'pdf-viewer',
  'quote',
  'read-more',
  'recommended-articles',
  'region-nav',
  'review',
  'section-metadata',
  'slideshare',
  'preflight',
  'promo',
  'quiz',
  'quiz-entry',
  'quiz-marquee',
  'quiz-results',
  'tabs',
  'table-of-contents',
  'text',
  'walls-io',
  'table',
  'table-metadata',
  'tags',
  'tag-selector',
  'tiktok',
  'twitter',
  'video',
  'vimeo',
  'youtube',
  'z-pattern',
  'share',
  'reading-time',
];
const AUTO_BLOCKS = [
  { adobetv: 'tv.adobe.com' },
  { gist: 'https://gist.github.com' },
  { caas: '/tools/caas' },
  { faas: '/tools/faas' },
  { fragment: '/fragments/' },
  { instagram: 'https://www.instagram.com' },
  { slideshare: 'https://www.slideshare.net' },
  { tiktok: 'https://www.tiktok.com' },
  { twitter: 'https://twitter.com' },
  { vimeo: 'https://vimeo.com' },
  { vimeo: 'https://player.vimeo.com' },
  { youtube: 'https://www.youtube.com' },
  { youtube: 'https://youtu.be' },
  { 'pdf-viewer': '.pdf' },
  { video: '.mp4' },
  { merch: '/tools/ost?' },
];
const DO_NOT_INLINE = [
  'accordion',
  'columns',
  'z-pattern',
];

const ENVS = {
  stage: {
    name: 'stage',
    ims: 'stg1',
    adobeIO: 'cc-collab-stage.adobe.io',
    adminconsole: 'stage.adminconsole.adobe.com',
    account: 'stage.account.adobe.com',
    edgeConfigId: '8d2805dd-85bf-4748-82eb-f99fdad117a6',
    pdfViewerClientId: '600a4521c23d4c7eb9c7b039bee534a0',
  },
  prod: {
    name: 'prod',
    ims: 'prod',
    adobeIO: 'cc-collab.adobe.io',
    adminconsole: 'adminconsole.adobe.com',
    account: 'account.adobe.com',
    edgeConfigId: '2cba807b-7430-41ae-9aac-db2b0da742d5',
    pdfViewerClientId: '3c0a5ddf2cc04d3198d9e48efc390fa9',
  },
};
ENVS.local = {
  ...ENVS.stage,
  name: 'local',
};

const MILO_EVENTS = { DEFERRED: 'milo:deferred' };

const LANGSTORE = 'langstore';
const PAGE_URL$1 = new URL(window.location.href);

function getEnv(conf) {
  const { host } = window.location;
  const query = PAGE_URL$1.searchParams.get('env');

  if (query) return { ...ENVS[query], consumer: conf[query] };
  if (host.includes('localhost')) return { ...ENVS.local, consumer: conf.local };
  /* c8 ignore start */
  if (host.includes('hlx.page')
    || host.includes('hlx.live')
    || host.includes('stage.adobe')
    || host.includes('corp.adobe')) {
    return { ...ENVS.stage, consumer: conf.stage };
  }
  return { ...ENVS.prod, consumer: conf.prod };
  /* c8 ignore stop */
}

function getLocale(locales, pathname = window.location.pathname) {
  if (!locales) {
    return { ietf: 'en-US', tk: 'hah7vzn.css', prefix: '' };
  }
  const split = pathname.split('/');
  const localeString = split[1];
  const locale = locales[localeString] || locales[''];
  if (localeString === LANGSTORE) {
    locale.prefix = `/${localeString}/${split[2]}`;
    if (
      Object.values(locales)
        .find((loc) => loc.ietf?.startsWith(split[2]))?.dir === 'rtl'
    ) locale.dir = 'rtl';
    return locale;
  }
  const isUS = locale.ietf === 'en-US';
  locale.prefix = isUS ? '' : `/${localeString}`;
  locale.region = isUS ? 'us' : localeString.split('_')[0];
  return locale;
}

function getMetadata$4(name, doc = document) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = doc.head.querySelector(`meta[${attr}="${name}"]`);
  return meta && meta.content;
}

const handleEntitlements = (() => {
  let entResolve;
  const entPromise = new Promise((resolve) => {
    entResolve = resolve;
  });

  return (resolveVal) => {
    if (resolveVal !== undefined) {
      entResolve(resolveVal);
    }
    return entPromise;
  };
})();

function setupMiloObj(config) {
  window.milo ||= {};
  window.milo.deferredPromise = new Promise((resolve) => {
    config.resolveDeferred = resolve;
  });
}

const [setConfig$1, updateConfig, getConfig$1] = (() => {
  let config = {};
  return [
    (conf) => {
      const origin = conf.origin || window.location.origin;
      const pathname = conf.pathname || window.location.pathname;
      config = { env: getEnv(conf), ...conf };
      config.codeRoot = conf.codeRoot ? `${origin}${conf.codeRoot}` : origin;
      config.base = config.miloLibs || config.codeRoot;
      config.locale = pathname ? getLocale(conf.locales, pathname) : getLocale(conf.locales);
      config.autoBlocks = conf.autoBlocks ? [...AUTO_BLOCKS, ...conf.autoBlocks] : AUTO_BLOCKS;
      config.doNotInline = conf.doNotInline
        ? [...DO_NOT_INLINE, ...conf.doNotInline]
        : DO_NOT_INLINE;
      const lang = getMetadata$4('content-language') || config.locale.ietf;
      document.documentElement.setAttribute('lang', lang);
      try {
        const dir = getMetadata$4('content-direction')
          || config.locale.dir
          || (config.locale.ietf && (new Intl.Locale(config.locale.ietf)?.textInfo?.direction))
          || 'ltr';
        document.documentElement.setAttribute('dir', dir);
      } catch (e) {
        console.log('Invalid or missing locale:', e);
      }
      config.locale.contentRoot = `${origin}${config.locale.prefix}${config.contentRoot ?? ''}`;
      config.useDotHtml = !PAGE_URL$1.origin.includes('.hlx.')
        && (conf.useDotHtml ?? PAGE_URL$1.pathname.endsWith('.html'));
      config.entitlements = handleEntitlements;
      config.consumerEntitlements = conf.entitlements || [];
      setupMiloObj(config);
      return config;
    },
    (conf) => (config = conf),
    () => config,
  ];
})();

function createTag$1(tag, attributes, html, options = {}) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement
      || html instanceof SVGElement
      || html instanceof DocumentFragment) {
      el.append(html);
    } else if (Array.isArray(html)) {
      el.append(...html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  options.parent?.append(el);
  return el;
}

function getExtension(path) {
  const pageName = path.split('/').pop();
  return pageName.includes('.') ? pageName.split('.').pop() : '';
}

function localizeLink(
  href,
  originHostName = window.location.hostname,
  overrideDomain = false,
) {
  try {
    const url = new URL(href);
    const relative = url.hostname === originHostName;
    const processedHref = relative ? href.replace(url.origin, '') : href;
    const { hash } = url;
    if (hash.includes('#_dnt')) return processedHref.replace('#_dnt', '');
    const path = url.pathname;
    const extension = getExtension(path);
    const allowedExts = ['', 'html', 'json'];
    if (!allowedExts.includes(extension)) return processedHref;
    const { locale, locales, prodDomains } = getConfig$1();
    if (!locale || !locales) return processedHref;
    const isLocalizable = relative || (prodDomains && prodDomains.includes(url.hostname))
      || overrideDomain;
    if (!isLocalizable) return processedHref;
    const isLocalizedLink = path.startsWith(`/${LANGSTORE}`) || Object.keys(locales)
      .some((loc) => loc !== '' && (path.startsWith(`/${loc}/`) || path.endsWith(`/${loc}`)));
    if (isLocalizedLink) return processedHref;
    const urlPath = `${locale.prefix}${path}${url.search}${hash}`;
    return relative ? urlPath : `${url.origin}${urlPath}`;
  } catch (error) {
    return href;
  }
}

function loadLink(href, { as, callback, crossorigin, rel, fetchpriority } = {}) {
  let link = document.head.querySelector(`link[href="${href}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    if (as) link.setAttribute('as', as);
    if (crossorigin) link.setAttribute('crossorigin', crossorigin);
    if (fetchpriority) link.setAttribute('fetchpriority', fetchpriority);
    link.setAttribute('href', href);
    if (callback) {
      link.onload = (e) => callback(e.type);
      link.onerror = (e) => callback(e.type);
    }
    document.head.appendChild(link);
  } else if (callback) {
    callback('noop');
  }
  return link;
}

function loadStyle$2(href, callback) {
  return loadLink(href, { rel: 'stylesheet', callback });
}

function appendHtmlToCanonicalUrl() {
  const { useDotHtml } = getConfig$1();
  if (!useDotHtml) return;
  const canonEl = document.head.querySelector('link[rel="canonical"]');
  if (!canonEl) return;
  const canonUrl = new URL(canonEl.href);
  if (canonUrl.pathname.endsWith('/') || canonUrl.pathname.endsWith('.html')) return;
  const pagePath = PAGE_URL$1.pathname.replace('.html', '');
  if (pagePath !== canonUrl.pathname) return;
  canonEl.setAttribute('href', `${canonEl.href}.html`);
}

function appendHtmlToLink(link) {
  const { useDotHtml } = getConfig$1();
  if (!useDotHtml) return;
  const href = link.getAttribute('href');
  if (!href?.length) return;

  const { autoBlocks = [], htmlExclude = [] } = getConfig$1();

  const HAS_EXTENSION = /\..*$/;
  let url = { pathname: href };

  try { url = new URL(href, PAGE_URL$1); } catch (e) { /* do nothing */ }

  if (!(href.startsWith('/') || href.startsWith(PAGE_URL$1.origin))
    || url.pathname?.endsWith('/')
    || href === PAGE_URL$1.origin
    || HAS_EXTENSION.test(href.split('/').pop())
    || htmlExclude?.some((excludeRe) => excludeRe.test(href))) {
    return;
  }

  const relativeAutoBlocks = autoBlocks
    .map((b) => Object.values(b)[0])
    .filter((b) => b.startsWith('/'));
  const isAutoblockLink = relativeAutoBlocks.some((block) => href.includes(block));
  if (isAutoblockLink) return;

  try {
    const linkUrl = new URL(href.startsWith('http') ? href : `${PAGE_URL$1.origin}${href}`);
    if (linkUrl.pathname && !linkUrl.pathname.endsWith('.html')) {
      linkUrl.pathname = `${linkUrl.pathname}.html`;
      link.setAttribute('href', href.startsWith('/')
        ? `${linkUrl.pathname}${linkUrl.search}${linkUrl.hash}`
        : linkUrl.href);
    }
  } catch (e) {
    window.lana?.log(`Error while attempting to append '.html' to ${link}: ${e}`);
  }
}

const loadScript$1 = (url, type) => new Promise((resolve, reject) => {
  let script = document.querySelector(`head > script[src="${url}"]`);
  if (!script) {
    const { head } = document;
    script = document.createElement('script');
    script.setAttribute('src', url);
    if (type) {
      script.setAttribute('type', type);
    }
    head.append(script);
  }

  if (script.dataset.loaded) {
    resolve(script);
    return;
  }

  const onScript = (event) => {
    script.removeEventListener('load', onScript);
    script.removeEventListener('error', onScript);

    if (event.type === 'error') {
      reject(new Error(`error loading script: ${script.src}`));
    } else if (event.type === 'load') {
      script.dataset.loaded = true;
      resolve(script);
    }
  };

  script.addEventListener('load', onScript);
  script.addEventListener('error', onScript);
});

async function loadTemplate() {
  const template = getMetadata$4('template');
  if (!template) return;
  const name = template.toLowerCase().replace(/[^0-9a-z]/gi, '-');
  document.body.classList.add(name);
  const { miloLibs, codeRoot } = getConfig$1();
  const base = miloLibs && MILO_TEMPLATES.includes(name) ? miloLibs : codeRoot;
  const styleLoaded = new Promise((resolve) => {
    loadStyle$2(`${base}/templates/${name}/${name}.css`, resolve);
  });
  const scriptLoaded = new Promise((resolve) => {
    (async () => {
      try {
        await import(`${base}/templates/${name}/${name}.js`);
      } catch (err) {
        console.log(`failed to load module for ${name}`, err);
      }
      resolve();
    })();
  });
  await Promise.all([styleLoaded, scriptLoaded]);
}

async function loadBlock$2(block) {
  if (block.classList.contains('hide-block')) {
    block.remove();
    return null;
  }

  const name = block.classList[0];
  const { miloLibs, codeRoot, mep } = getConfig$1();

  const base = miloLibs && MILO_BLOCKS.includes(name) ? miloLibs : codeRoot;
  let path = `${base}/blocks/${name}`;

  if (mep?.blocks?.[name]) path = mep.blocks[name];

  const blockPath = `${path}/${name}`;

  const styleLoaded = new Promise((resolve) => {
    loadStyle$2(`${blockPath}.css`, resolve);
  });

  const scriptLoaded = new Promise((resolve) => {
    (async () => {
      try {
        const { default: init } = await import(`${blockPath}.js`);
        await init(block);
      } catch (err) {
        console.log(`Failed loading ${name}`, err);
        const config = getConfig$1();
        if (config.env.name !== 'prod') {
          const { showError } = await Promise.resolve().then(() => fallback);
          showError(block, name);
        }
      }
      resolve();
    })();
  });
  await Promise.all([styleLoaded, scriptLoaded]);
  return block;
}

function decorateSVG(a) {
  const { textContent, href } = a;
  if (!(textContent.includes('.svg') || href.includes('.svg'))) return a;
  try {
    // Mine for URL and alt text
    const splitText = textContent.split('|');
    const textUrl = new URL(splitText.shift().trim());
    const altText = splitText.join('|').trim();

    // Relative link checking
    const hrefUrl = a.href.startsWith('/')
      ? new URL(`${window.location.origin}${a.href}`)
      : new URL(a.href);

    const src = textUrl.hostname.includes('.hlx.') ? textUrl.pathname : textUrl;

    const img = createTag$1('img', { loading: 'lazy', src });
    if (altText) img.alt = altText;
    const pic = createTag$1('picture', null, img);

    if (textUrl.pathname === hrefUrl.pathname) {
      a.parentElement.replaceChild(pic, a);
      return pic;
    }
    a.textContent = '';
    a.append(pic);
    return a;
  } catch (e) {
    console.log('Failed to create SVG.', e.message);
    return a;
  }
}

function decorateImageLinks(el) {
  const images = el.querySelectorAll('img[alt*="|"]');
  if (!images.length) return;
  [...images].forEach((img) => {
    const [source, alt, icon] = img.alt.split('|');
    try {
      const url = new URL(source.trim());
      const href = url.hostname.includes('.hlx.') ? `${url.pathname}${url.hash}` : url.href;
      if (alt?.trim().length) img.alt = alt.trim();
      const pic = img.closest('picture');
      const picParent = pic.parentElement;
      if (href.includes('.mp4')) {
        const a = createTag$1('a', { href: url, 'data-video-poster': img.src });
        a.innerHTML = url;
        pic.replaceWith(a);
      } else {
        const aTag = createTag$1('a', { href, class: 'image-link' });
        picParent.insertBefore(aTag, pic);
        if (icon) {
          Promise.resolve().then(() => imageVideoLink).then((mod) => mod.default(picParent, aTag, icon));
        } else {
          aTag.append(pic);
        }
      }
    } catch (e) {
      console.log('Error:', `${e.message} '${source.trim()}'`);
    }
  });
}

function decorateAutoBlock(a) {
  const config = getConfig$1();
  const { hostname } = window.location;
  let url;
  try {
    url = new URL(a.href);
  } catch (e) {
    window.lana?.log(`Cannot make URL from decorateAutoBlock - ${a?.href}: ${e.toString()}`);
    return false;
  }

  const href = hostname === url.hostname
    ? `${url.pathname}${url.search}${url.hash}`
    : a.href;

  return config.autoBlocks.find((candidate) => {
    const key = Object.keys(candidate)[0];
    const match = href.includes(candidate[key]);
    if (!match) return false;

    if (key === 'pdf-viewer' && !a.textContent.includes('.pdf')) {
      a.target = '_blank';
      return false;
    }

    const hasExtension = a.href.split('/').pop().includes('.');
    const mp4Match = a.textContent.match('media_.*.mp4');
    if (key === 'fragment' && (!hasExtension || mp4Match)) {
      if (a.href === window.location.href) {
        return false;
      }

      const isInlineFrag = url.hash.includes('#_inline');
      if (url.hash === '' || isInlineFrag) {
        const { parentElement } = a;
        const { nodeName, innerHTML } = parentElement;
        const noText = innerHTML === a.outerHTML;
        if (noText && nodeName === 'P') {
          const div = createTag$1('div', null, a);
          parentElement.parentElement.replaceChild(div, parentElement);
        }
      }

      // previewing a fragment page with mp4 video
      if (mp4Match) {
        a.className = 'video link-block';
        return false;
      }

      // Modals
      if (url.hash !== '' && !isInlineFrag) {
        a.dataset.modalPath = url.pathname;
        a.dataset.modalHash = url.hash;
        a.href = url.hash;
        a.className = `modal link-block ${[...a.classList].join(' ')}`;
        return true;
      }
    }

    // slack uploaded mp4s
    if (key === 'video' && !a.textContent.match('media_.*.mp4')) {
      return false;
    }

    a.className = `${key} link-block`;
    return true;
  });
}

function decorateLinks(el) {
  decorateImageLinks(el);
  const anchors = el.getElementsByTagName('a');
  return [...anchors].reduce((rdx, a) => {
    appendHtmlToLink(a);
    a.href = localizeLink(a.href);
    decorateSVG(a);
    if (a.href.includes('#_blank')) {
      a.setAttribute('target', '_blank');
      a.href = a.href.replace('#_blank', '');
    }
    if (a.href.includes('#_dnb')) {
      a.href = a.href.replace('#_dnb', '');
    } else {
      const autoBlock = decorateAutoBlock(a);
      if (autoBlock) {
        rdx.push(a);
      }
    }
    return rdx;
  }, []);
}

function decorateContent(el) {
  const children = [el];
  let child = el;
  while (child) {
    child = child.nextElementSibling;
    if (child && child.nodeName !== 'DIV') {
      children.push(child);
    } else {
      break;
    }
  }
  const block = document.createElement('div');
  block.className = 'content';
  block.append(...children);
  block.dataset.block = '';
  return block;
}

function decorateDefaults(el) {
  const firstChild = ':scope > *:not(div):first-child';
  const afterBlock = ':scope > div + *:not(div)';
  const children = el.querySelectorAll(`${firstChild}, ${afterBlock}`);
  children.forEach((child) => {
    const prev = child.previousElementSibling;
    const content = decorateContent(child);
    if (prev) {
      prev.insertAdjacentElement('afterend', content);
    } else {
      el.insertAdjacentElement('afterbegin', content);
    }
  });
}

function decorateHeader() {
  const header = document.querySelector('header');
  if (!header) return;
  const headerMeta = getMetadata$4('header');
  if (headerMeta === 'off') {
    document.body.classList.add('nav-off');
    header.remove();
    return;
  }
  header.className = headerMeta || 'gnav';
  const metadataConfig = getMetadata$4('breadcrumbs')?.toLowerCase()
  || getConfig$1().breadcrumbs;
  if (metadataConfig === 'off') return;
  const baseBreadcrumbs = getMetadata$4('breadcrumbs-base')?.length;
  const breadcrumbs = document.querySelector('.breadcrumbs');
  const autoBreadcrumbs = getMetadata$4('breadcrumbs-from-url') === 'on';
  if (baseBreadcrumbs || breadcrumbs || autoBreadcrumbs) header.classList.add('has-breadcrumbs');
  if (breadcrumbs) header.append(breadcrumbs);
  const promo = getMetadata$4('gnav-promo-source');
  if (promo?.length) header.classList.add('has-promo');
}

async function decorateIcons(area, config) {
  const icons$1 = area.querySelectorAll('span.icon');
  if (icons$1.length === 0) return;
  const { miloLibs, codeRoot } = config;
  const base = miloLibs || codeRoot;
  await new Promise((resolve) => { loadStyle$2(`${base}/features/icons/icons.css`, resolve); });
  const { default: loadIcons } = await Promise.resolve().then(() => icons);
  await loadIcons(icons$1, config);
}

async function decoratePlaceholders(area, config) {
  const el = area.querySelector('main') || area;
  const regex = /{{(.*?)}}|%7B%7B(.*?)%7D%7D/g;
  const found = regex.test(el.innerHTML);
  if (!found) return;
  const { replaceText } = await Promise.resolve().then(() => placeholders);
  el.innerHTML = await replaceText(el.innerHTML, config, regex);
}

async function loadFooter() {
  const footer = document.querySelector('footer');
  if (!footer) return;
  const footerMeta = getMetadata$4('footer');
  if (footerMeta === 'off') {
    footer.remove();
    return;
  }
  footer.className = footerMeta || 'footer';
  await loadBlock$2(footer);
}

function filterDuplicatedLinkBlocks(blocks) {
  if (!blocks?.length) return [];
  const uniqueModalKeys = new Set();
  const uniqueBlocks = [];
  for (const obj of blocks) {
    if (obj.className.includes('modal')) {
      const key = `${obj.dataset.modalHash}-${obj.dataset.modalPath}`;
      if (!uniqueModalKeys.has(key)) {
        uniqueModalKeys.add(key);
        uniqueBlocks.push(obj);
      }
    } else {
      uniqueBlocks.push(obj);
    }
  }
  return uniqueBlocks;
}

function decorateSection(section, idx) {
  let links = decorateLinks(section);
  decorateDefaults(section);
  const blocks = section.querySelectorAll(':scope > div[class]:not(.content)');

  const { doNotInline } = getConfig$1();
  const blockLinks = [...blocks].reduce((blkLinks, block) => {
    const blockName = block.classList[0];
    links.filter((link) => block.contains(link))
      .forEach((link) => {
        if (link.classList.contains('fragment')
          && MILO_BLOCKS.includes(blockName) // do not inline consumer blocks (for now)
          && !doNotInline.includes(blockName)) {
          if (!link.href.includes('#_inline')) {
            link.href = `${link.href}#_inline`;
          }
          blkLinks.inlineFrags.push(link);
        } else if (link.classList.contains('link-block')) {
          blkLinks.autoBlocks.push(link);
        }
      });
    return blkLinks;
  }, { inlineFrags: [], autoBlocks: [] });

  const embeddedLinks = [...blockLinks.inlineFrags, ...blockLinks.autoBlocks];
  if (embeddedLinks.length) {
    links = links.filter((link) => !embeddedLinks.includes(link));
  }
  section.className = 'section';
  section.dataset.status = 'decorated';
  section.dataset.idx = idx;
  return {
    blocks: [...links, ...blocks],
    el: section,
    idx,
    preloadLinks: filterDuplicatedLinkBlocks(blockLinks.autoBlocks),
  };
}

function decorateSections(el, isDoc) {
  const selector = isDoc ? 'body > main > div' : ':scope > div';
  return [...el.querySelectorAll(selector)].map(decorateSection);
}

async function decorateFooterPromo(doc = document) {
  const footerPromoTag = getMetadata$4('footer-promo-tag', doc);
  const footerPromoType = getMetadata$4('footer-promo-type', doc);
  if (!footerPromoTag && footerPromoType !== 'taxonomy') return;

  const { default: initFooterPromo } = await Promise.resolve().then(() => footerPromo);
  await initFooterPromo(footerPromoTag, footerPromoType, doc);
}

let imsLoaded;
async function loadIms() {
  imsLoaded = imsLoaded || new Promise((resolve, reject) => {
    const { locale, imsClientId, imsScope, env, base } = getConfig$1();
    if (!imsClientId) {
      reject(new Error('Missing IMS Client ID'));
      return;
    }
    const [unavMeta, ahomeMeta] = [getMetadata$4('universal-nav')?.trim(), getMetadata$4('adobe-home-redirect')];
    const defaultScope = `AdobeID,openid,gnav${unavMeta && unavMeta !== 'off' ? ',pps.read,firefly_api,additional_info.roles,read_organizations' : ''}`;
    const timeout = setTimeout(() => reject(new Error('IMS timeout')), 5000);
    window.adobeid = {
      client_id: imsClientId,
      scope: imsScope || defaultScope,
      locale: locale?.ietf?.replace('-', '_') || 'en_US',
      redirect_uri: ahomeMeta === 'on'
        ? `https://www${env.name !== 'prod' ? '.stage' : ''}.adobe.com${locale.prefix}` : undefined,
      autoValidateToken: true,
      environment: env.ims,
      useLocalStorage: false,
      onReady: () => {
        resolve();
        clearTimeout(timeout);
      },
      onError: reject,
    };
    const path = PAGE_URL$1.searchParams.get('useAlternateImsDomain')
      ? 'https://auth.services.adobe.com/imslib/imslib.min.js'
      : `https://main--milo--adobecom.hlx.page/libs/deps/imslib.min.js`;
    loadScript$1(path);
  }).then(() => {
    if (!window.adobeIMS?.isSignedInUser()) {
      getConfig$1().entitlements([]);
    }
  });

  return imsLoaded;
}

async function loadMartech({ persEnabled = false, persManifests = [] } = {}) {
  // eslint-disable-next-line no-underscore-dangle
  if (window.marketingtech?.adobe?.launch && window._satellite) {
    return true;
  }

  const query = PAGE_URL$1.searchParams.get('martech');
  if (query === 'off' || getMetadata$4('martech') === 'off') {
    return false;
  }

  window.targetGlobalSettings = { bodyHidingEnabled: false };
  loadIms().catch(() => {});

  const { default: initMartech } = await Promise.resolve().then(() => martech);
  await initMartech({ persEnabled, persManifests });

  return true;
}

const getMepValue = (val) => {
  const valMap = { on: true, off: false, gnav: 'gnav' };
  const finalVal = val?.toLowerCase().trim();
  if (finalVal in valMap) return valMap[finalVal];
  return finalVal;
};

const getMepEnablement = (mdKey, paramKey = false) => {
  const paramValue = PAGE_URL$1.searchParams.get(paramKey || mdKey);
  if (paramValue) return getMepValue(paramValue);
  const mdValue = getMetadata$4(mdKey);
  if (!mdValue) return false;
  return getMepValue(mdValue);
};

const combineMepSources = async (persEnabled, promoEnabled, mepParam) => {
  let persManifests = [];

  if (persEnabled) {
    persManifests = persEnabled.toLowerCase()
      .split(/,|(\s+)|(\\n)/g)
      .filter((path) => path?.trim())
      .map((manifestPath) => ({ manifestPath }));
  }

  if (promoEnabled) {
    const { default: getPromoManifests } = await Promise.resolve().then(() => promoUtils);
    persManifests = persManifests.concat(getPromoManifests(promoEnabled, PAGE_URL$1.searchParams));
  }

  if (mepParam && mepParam !== 'off') {
    const persManifestPaths = persManifests.map((manifest) => {
      const { manifestPath } = manifest;
      if (manifestPath.startsWith('/')) return manifestPath;
      try {
        const url = new URL(manifestPath);
        return url.pathname;
      } catch (e) {
        return manifestPath;
      }
    });

    mepParam.split('---').forEach((manifestPair) => {
      const manifestPath = manifestPair.trim().toLowerCase().split('--')[0];
      if (!persManifestPaths.includes(manifestPath)) {
        persManifests.push({ manifestPath });
      }
    });
  }
  return persManifests;
};

async function checkForPageMods() {
  const { mep: mepParam } = Object.fromEntries(PAGE_URL$1.searchParams);
  if (mepParam === 'off') return;
  const persEnabled = getMepEnablement('personalization');
  const promoEnabled = getMepEnablement('manifestnames', 'promo');
  const targetEnabled = getMepEnablement('target');
  const mepEnabled = persEnabled || targetEnabled || promoEnabled || mepParam;
  if (!mepEnabled) return;

  const config = getConfig$1();
  config.mep = { targetEnabled };
  loadLink(
    `${config.base}/features/personalization/personalization.js`,
    { as: 'script', rel: 'modulepreload' },
  );

  const persManifests = await combineMepSources(persEnabled, promoEnabled, mepParam);
  if (targetEnabled === true) {
    await loadMartech({ persEnabled: true, persManifests, targetEnabled });
    return;
  }
  if (!persManifests.length) return;

  loadIms()
    .then(() => {
      if (window.adobeIMS.isSignedInUser()) loadMartech();
    })
    .catch((e) => { console.log('Unable to load IMS:', e); });

  const { preloadManifests, applyPers } = await Promise.resolve().then(() => personalization);
  const manifests = preloadManifests({ persManifests }, { getConfig: getConfig$1, loadLink });

  await applyPers(manifests);
}

async function loadPostLCP(config) {
  const georouting = getMetadata$4('georouting') || config.geoRouting;
  if (georouting === 'on') {
    const { default: loadGeoRouting } = await Promise.resolve().then(() => georoutingv2);
    await loadGeoRouting(config, createTag$1, getMetadata$4, loadBlock$2, loadStyle$2);
  }
  if (config.mep?.targetEnabled === 'gnav') {
    await loadMartech({ persEnabled: true, postLCP: true });
  } else {
    loadMartech();
  }
  const header = document.querySelector('header');
  if (header) {
    header.classList.add('gnav-hide');
    await loadBlock$2(header);
    header.classList.remove('gnav-hide');
  }
  loadTemplate();
  const { default: loadFonts } = await Promise.resolve().then(() => fonts);
  loadFonts(config.locale, loadStyle$2);
  if (config.mep?.preview) {
    Promise.resolve().then(() => preview)
      .then(({ default: decoratePreviewMode }) => decoratePreviewMode());
  }
}

function scrollToHashedElement(hash) {
  if (!hash) return;
  const elementId = decodeURIComponent(hash).slice(1);
  let targetElement;
  try {
    targetElement = document.querySelector(`#${elementId}:not(.dialog-modal)`);
  } catch (e) {
    window.lana?.log(`Could not query element because of invalid hash - ${elementId}: ${e.toString()}`);
  }
  if (!targetElement) return;
  const bufferHeight = document.querySelector('.global-navigation')?.offsetHeight || 0;
  const topOffset = targetElement.getBoundingClientRect().top + window.pageYOffset;
  window.scrollTo({
    top: topOffset - bufferHeight,
    behavior: 'smooth',
  });
}

async function loadDeferred(area, blocks, config) {
  const event = new Event(MILO_EVENTS.DEFERRED);
  area.dispatchEvent(event);

  if (area !== document) {
    return;
  }

  config.resolveDeferred?.(true);

  if (config.links === 'on') {
    const path = `${config.contentRoot || ''}${getMetadata$4('links-path') || '/seo/links.json'}`;
    Promise.resolve().then(() => links).then((mod) => mod.default(path, area));
  }

  if (config.locale?.ietf === 'ja-JP') {
    // Japanese word-wrap
    Promise.resolve().then(() => japaneseWordWrap).then(({ default: controlJapaneseLineBreaks }) => {
      controlJapaneseLineBreaks(config, area);
    });
  }

  Promise.resolve().then(() => samplerum).then(({ sampleRUM }) => {
    sampleRUM('lazy');
    sampleRUM.observe(blocks);
    sampleRUM.observe(area.querySelectorAll('picture > img'));
  });
}

function initSidekick() {
  const initPlugins = async () => {
    const { default: init } = await Promise.resolve().then(() => sidekick);
    init({ createTag: createTag$1, loadBlock: loadBlock$2, loadScript: loadScript$1, loadStyle: loadStyle$2 });
  };

  if (document.querySelector('helix-sidekick')) {
    initPlugins();
  } else {
    document.addEventListener('sidekick-ready', () => {
      initPlugins();
    });
  }
}

function decorateMeta() {
  const { origin } = window.location;
  const contents = document.head.querySelectorAll('[content*=".hlx."]');
  contents.forEach((meta) => {
    if (meta.getAttribute('property') === 'hlx:proxyUrl') return;
    try {
      const url = new URL(meta.content);
      const localizedLink = localizeLink(`${origin}${url.pathname}`);
      const localizedURL = localizedLink.includes(origin) ? localizedLink : `${origin}${localizedLink}`;
      meta.setAttribute('content', `${localizedURL}${url.search}${url.hash}`);
    } catch (e) {
      window.lana?.log(`Cannot make URL from metadata - ${meta.content}: ${e.toString()}`);
    }
  });

  // Event-based modal
  window.addEventListener('modal:open', async (e) => {
    const { miloLibs } = getConfig$1();
    const { findDetails, getModal } = await Promise.resolve().then(() => modal);
    loadStyle$2(`${miloLibs}/blocks/modal/modal.css`);
    const details = findDetails(e.detail.hash);
    if (details) getModal(details);
  });
}

function decorateDocumentExtras() {
  decorateMeta();
  decorateHeader();

  Promise.resolve().then(() => samplerum).then(({ addRumListeners }) => {
    addRumListeners();
  });
}

async function documentPostSectionLoading(config) {
  decorateFooterPromo();

  const appendage = getMetadata$4('title-append');
  if (appendage) {
    Promise.resolve().then(() => titleAppend$1).then((module) => module.default(appendage));
  }
  if (getMetadata$4('seotech-structured-data') === 'on' || getMetadata$4('seotech-video-url')) {
    Promise.resolve().then(() => seotech).then((module) => module.default(
      { locationUrl: window.location.href, getMetadata: getMetadata$4, createTag: createTag$1, getConfig: getConfig$1 },
    ));
  }
  const richResults = getMetadata$4('richresults');
  if (richResults) {
    const { default: addRichResults } = await Promise.resolve().then(() => richresults);
    addRichResults(richResults, { createTag: createTag$1, getMetadata: getMetadata$4 });
  }
  loadFooter();
  const { default: loadFavIcon } = await Promise.resolve().then(() => favicon);
  loadFavIcon(createTag$1, getConfig$1(), getMetadata$4);
  if (config.experiment?.selectedVariant?.scripts?.length) {
    config.experiment.selectedVariant.scripts.forEach((script) => loadScript$1(script));
  }
  initSidekick();

  const { default: delayed$1 } = await Promise.resolve().then(() => delayed);
  delayed$1([getConfig$1, getMetadata$4, loadScript$1, loadStyle$2, loadIms]);

  Promise.resolve().then(() => attributes).then((analytics) => {
    document.querySelectorAll('main > div').forEach((section, idx) => analytics.decorateSectionAnalytics(section, idx, config));
  });

  document.body.appendChild(createTag$1('div', { id: 'page-load-ok-milo', style: 'display: none;' }));
}

async function processSection(section, config, isDoc) {
  const inlineFrags = [...section.el.querySelectorAll('a[href*="#_inline"]')];
  if (inlineFrags.length) {
    const { default: loadInlineFrags } = await Promise.resolve().then(() => fragment);
    const fragPromises = inlineFrags.map((link) => loadInlineFrags(link));
    await Promise.all(fragPromises);
    await decoratePlaceholders(section.el, config);
    const newlyDecoratedSection = decorateSection(section.el, section.idx);
    section.blocks = newlyDecoratedSection.blocks;
    section.preloadLinks = newlyDecoratedSection.preloadLinks;
  }

  if (section.preloadLinks.length) {
    const preloads = section.preloadLinks.map((block) => loadBlock$2(block));
    await Promise.all(preloads);
  }

  const loaded = section.blocks.map((block) => loadBlock$2(block));

  await decorateIcons(section.el, config);

  // Only move on to the next section when all blocks are loaded.
  await Promise.all(loaded);

  // Show the section when all blocks inside are done.
  delete section.el.dataset.status;

  if (isDoc && section.el.dataset.idx === '0') {
    await loadPostLCP(config);
  }

  delete section.el.dataset.idx;

  return section.blocks;
}

async function loadArea(area = document) {
  const isDoc = area === document;

  if (isDoc) {
    await checkForPageMods();
    appendHtmlToCanonicalUrl();
  }
  const config = getConfig$1();

  await decoratePlaceholders(area, config);

  if (isDoc) {
    decorateDocumentExtras();
  }

  const sections = decorateSections(area, isDoc);

  const areaBlocks = [];
  for (const section of sections) {
    const sectionBlocks = await processSection(section, config, isDoc);
    areaBlocks.push(...sectionBlocks);

    areaBlocks.forEach((block) => {
      if (!block.className.includes('metadata')) block.dataset.block = '';
    });
  }

  const currentHash = window.location.hash;
  if (currentHash) {
    scrollToHashedElement(currentHash);
  }

  if (isDoc) await documentPostSectionLoading(config);

  await loadDeferred(area, areaBlocks, config);
}

function loadLana(options = {}) {
  if (window.lana) return;

  const lanaError = (e) => {
    window.lana?.log(e.reason || e.error || e.message, { errorType: 'i' });
  };

  window.lana = {
    log: async (...args) => {
      window.removeEventListener('error', lanaError);
      window.removeEventListener('unhandledrejection', lanaError);
      await Promise.resolve().then(() => lana);
      return window.lana.log(...args);
    },
    debug: false,
    options,
  };

  window.addEventListener('error', lanaError);
  window.addEventListener('unhandledrejection', lanaError);
}

const utils = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  MILO_EVENTS,
  appendHtmlToCanonicalUrl,
  appendHtmlToLink,
  combineMepSources,
  createTag: createTag$1,
  decorateAutoBlock,
  decorateFooterPromo,
  decorateImageLinks,
  decorateLinks,
  decorateSVG,
  filterDuplicatedLinkBlocks,
  getConfig: getConfig$1,
  getLocale,
  getMepEnablement,
  getMetadata: getMetadata$4,
  loadArea,
  loadBlock: loadBlock$2,
  loadDeferred,
  loadIms,
  loadLana,
  loadLink,
  loadMartech,
  loadScript: loadScript$1,
  loadStyle: loadStyle$2,
  loadTemplate,
  localizeLink,
  scrollToHashedElement,
  setConfig: setConfig$1,
  updateConfig
}, Symbol.toStringTag, { value: 'Module' }));

const INVALID_CHARACTERS = /[^\u00C0-\u1FFF\u2C00-\uD7FF\w]+/g;
const LEAD_UNDERSCORES = /^_+|_+$/g;

function processTrackingLabels(text, config, charLimit) {
  let analyticsValue = text?.replace(INVALID_CHARACTERS, ' ').replace(LEAD_UNDERSCORES, '').trim();
  if (config) {
    const { analyticLocalization, loc = analyticLocalization?.[analyticsValue] } = config;
    if (loc) analyticsValue = loc;
  }
  if (charLimit) return analyticsValue.slice(0, charLimit);
  return analyticsValue;
}

function decorateDefaultLinkAnalytics(block, config) {
  if (block.classList.length
    && !block.className.includes('metadata')
    && !block.classList.contains('link-block')
    && !block.classList.contains('section')
    && block.nodeName === 'DIV') {
    let header = '';
    let linkCount = 1;

    const headerSelector = 'h1, h2, h3, h4, h5, h6';
    let analyticsSelector = `${headerSelector}, .tracking-header`;
    const headers = block.querySelectorAll(analyticsSelector);
    if (!headers.length) analyticsSelector = `${analyticsSelector}, b, strong`;
    block.querySelectorAll(`${analyticsSelector}, a:not(.video.link-block), button`).forEach((item) => {
      if (item.nodeName === 'A' || item.nodeName === 'BUTTON') {
        if (item.classList.contains('tracking-header')) {
          header = processTrackingLabels(item.textContent, config, 20);
        } else if (!header) {
          const section = block.closest('.section');
          if (section?.className.includes('-up') || section?.classList.contains('milo-card-section')) {
            const previousHeader = section?.previousElementSibling?.querySelector(headerSelector);
            if (previousHeader) {
              header = processTrackingLabels(previousHeader.textContent, config, 20);
            }
          }
        }
        if (item.hasAttribute('daa-ll')) {
          const labelArray = item.getAttribute('daa-ll').split('-').map((part) => {
            if (part === '') return '';
            return processTrackingLabels(part, config, 20);
          });
          item.setAttribute('daa-ll', labelArray.join('-'));
        } else {
          let label = item.textContent?.trim();
          if (label === '') {
            label = item.getAttribute('title')
                || item.getAttribute('aria-label')
                || item.querySelector('img')?.getAttribute('alt')
                || 'no label';
          }
          label = processTrackingLabels(label, config, 20);
          item.setAttribute('daa-ll', `${label}-${linkCount}--${header}`);
        }
        linkCount += 1;
      } else {
        if (item.nodeName === 'STRONG' || item.nodeName === 'B') {
          item.classList.add('tracking-header');
        }
        header = processTrackingLabels(item.textContent, config, 20);
      }
    });
  }
}

async function decorateSectionAnalytics(section, idx, config) {
  document.querySelector('main')?.setAttribute('daa-im', 'true');
  section.setAttribute('daa-lh', `s${idx + 1}`);
  section.querySelectorAll('[data-block] [data-block]').forEach((block) => {
    block.removeAttribute('data-block');
  });
  const mepMartech = config?.mep?.martech || '';
  section.querySelectorAll('[data-block]').forEach((block, blockIdx) => {
    const blockName = block.classList[0] || '';
    block.setAttribute('daa-lh', `b${blockIdx + 1}|${blockName.slice(0, 15)}${mepMartech}`);
    decorateDefaultLinkAnalytics(block, config);
    block.removeAttribute('data-block');
  });
}

// below functions are being sunset
function decorateBlockAnalytics() { return false; }
function decorateLinkAnalytics() { return false; }

const RE_ALPHANUM = /[^0-9a-z]/gi;
const RE_TRIM_UNDERSCORE = /^_+|_+$/g;
const analyticsGetLabel = (txt) => txt.replaceAll('&', 'and')
  .replace(RE_ALPHANUM, '_')
  .replace(RE_TRIM_UNDERSCORE, '');

const analyticsDecorateList = (li, idx) => {
  const link = li.firstChild?.nodeName === 'A' && li.firstChild;
  if (!link) return;

  const label = link.textContent || link.getAttribute('aria-label');
  if (!label) return;

  link.setAttribute('daa-ll', `${analyticsGetLabel(label)}-${idx + 1}`);
};

const attributes = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  analyticsDecorateList,
  analyticsGetLabel,
  decorateBlockAnalytics,
  decorateDefaultLinkAnalytics,
  decorateLinkAnalytics,
  decorateSectionAnalytics,
  processTrackingLabels
}, Symbol.toStringTag, { value: 'Module' }));

const fetchedPlaceholders = {};

const getPlaceholdersPath = (config, sheet) => {
  const path = `${config.locale.contentRoot}/placeholders.json`;
  const query = sheet !== 'default' && typeof sheet === 'string' && sheet.length ? `?sheet=${sheet}` : '';
  return `${path}${query}`;
};

const fetchPlaceholders = async (config, sheet) => {
  const placeholdersPath = getPlaceholdersPath(config, sheet);
  const { customFetch } = await Promise.resolve().then(() => helpers);

  fetchedPlaceholders[placeholdersPath] = fetchedPlaceholders[placeholdersPath]
    // eslint-disable-next-line no-async-promise-executor
    || new Promise(async (resolve) => {
      const resp = await customFetch({ resource: placeholdersPath, withCacheRules: true })
        .catch(() => ({}));
      const json = resp.ok ? await resp.json() : { data: [] };
      if (json.data.length === 0) { resolve({}); return; }
      const placeholders = {};
      json.data.forEach((item) => {
        placeholders[item.key] = item.value;
      });
      resolve(placeholders);
    });

  return fetchedPlaceholders[placeholdersPath];
};

function keyToStr(key) {
  return key.replaceAll('-', ' ');
}

async function getPlaceholder(key, config, sheet) {
  let defaultFetched = false;
  const defaultLocale = 'en-US';

  const getDefaultContentRoot = () => {
    const defaultContentRoot = config.locale.contentRoot;
    const localePrefix = config.locale.prefix;

    if (!localePrefix.length) return defaultContentRoot;

    // Certain locale prefixes are common beginnings of words, such as /es
    // This could also be part of a page path, such as '/esign'
    if (defaultContentRoot.endsWith(localePrefix)) {
      return defaultContentRoot.replace(localePrefix, '');
    }

    return defaultContentRoot.replace(`${localePrefix}/`, '/');
  };

  const getDefaultPlaceholders = async () => {
    const defaultConfig = {
      locale: {
        ietf: defaultLocale,
        contentRoot: getDefaultContentRoot(),
      },
    };

    const defaultPlaceholders = await fetchPlaceholders(defaultConfig, sheet)
      .catch(() => ({}));
    defaultFetched = true;
    return defaultPlaceholders;
  };

  if (config.placeholders?.[key]) return config.placeholders[key];

  const placeholders = await fetchPlaceholders(config, sheet).catch(async () => {
    const defaultPlaceholders = await getDefaultPlaceholders();
    return defaultPlaceholders;
  });

  if (typeof placeholders?.[key] === 'string') return placeholders[key];

  if (!defaultFetched && config.locale.ietf !== defaultLocale) {
    const defaultPlaceholders = await getDefaultPlaceholders();
    if (defaultPlaceholders?.[key]) return defaultPlaceholders[key];
  }

  return keyToStr(key);
}

async function replaceKey(key, config, sheet = 'default') {
  if (typeof key !== 'string' || !key.length) return '';

  const label = await getPlaceholder(key, config, sheet);
  return label;
}

async function replaceKeyArray(keys, config, sheet = 'default') {
  if (!Array.isArray(keys) || !keys.length) return [];

  const promiseArr = [];
  keys.forEach((key) => {
    promiseArr.push(getPlaceholder(key, config, sheet));
  });

  const placeholders = await Promise.all(promiseArr);
  return placeholders;
}

async function replaceText(text, config, regex = /{{(.*?)}}|%7B%7B(.*?)%7D%7D/g, sheet = 'default') {
  if (typeof text !== 'string' || !text.length) return '';

  const matches = [...text.matchAll(new RegExp(regex))];
  if (!matches.length) {
    return text;
  }
  const keys = Array.from(matches, (match) => (match[1] || match[2]));
  const placeholders = await replaceKeyArray(keys, config, sheet);
  // The .shift method is very slow, thus using normal iterator
  let i = 0;
  // eslint-disable-next-line no-plusplus
  const finalText = text.replaceAll(regex, () => placeholders[i++]);
  return finalText;
}

const placeholders = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  replaceKey,
  replaceKeyArray,
  replaceText
}, Symbol.toStringTag, { value: 'Module' }));

loadLana();

const FEDERAL_PATH_KEY = 'federal';

// TODO when porting this to milo core, we should define this on config level
// and allow consumers to add their own origins
const allowedOrigins = [
  'https://www.adobe.com',
  'https://business.adobe.com',
  'https://blog.adobe.com',
  'https://milo.adobe.com',
];

const selectors = {
  globalNav: '.global-navigation',
  curtain: '.feds-curtain',
  navLink: '.feds-navLink',
  overflowingTopNav: '.feds-topnav--overflowing',
  navItem: '.feds-navItem',
  activeNavItem: '.feds-navItem--active',
  deferredActiveNavItem: '.feds-navItem--activeDeferred',
  activeDropdown: '.feds-dropdown--active',
  menuSection: '.feds-menu-section',
  menuColumn: '.feds-menu-column',
  gnavPromo: '.gnav-promo',
  columnBreak: '.column-break',
};

const icons$1 = {
  company: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 133.5 118.1"><defs><style>.cls-1 {fill: #eb1000;}</style></defs><g><g><polygon class="cls-1" points="84.1 0 133.5 0 133.5 118.1 84.1 0"/><polygon class="cls-1" points="49.4 0 0 0 0 118.1 49.4 0"/><polygon class="cls-1" points="66.7 43.5 98.2 118.1 77.6 118.1 68.2 94.4 45.2 94.4 66.7 43.5"/></g></g></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5 16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z"></path></svg>',
  home: '<svg xmlns="http://www.w3.org/2000/svg" height="25" viewBox="0 0 18 18" width="25"><path fill="#6E6E6E" d="M17.666,10.125,9.375,1.834a.53151.53151,0,0,0-.75,0L.334,10.125a.53051.53051,0,0,0,0,.75l.979.9785A.5.5,0,0,0,1.6665,12H2v4.5a.5.5,0,0,0,.5.5h4a.5.5,0,0,0,.5-.5v-5a.5.5,0,0,1,.5-.5h3a.5.5,0,0,1,.5.5v5a.5.5,0,0,0,.5.5h4a.5.5,0,0,0,.5-.5V12h.3335a.5.5,0,0,0,.3535-.1465l.979-.9785A.53051.53051,0,0,0,17.666,10.125Z"/></svg>',
};

const lanaLog = ({ message, e = '', tags = 'errorType=default' }) => {
  const url = getMetadata$4('gnav-source');
  window.lana.log(`${message} | gnav-source: ${url} | href: ${window.location.href} | ${e.reason || e.error || e.message || e}`, {
    clientId: 'feds-milo',
    sampleRate: 1,
    tags,
  });
};

const logErrorFor = async (fn, message, tags) => {
  try {
    await fn();
  } catch (e) {
    lanaLog({ message, e, tags });
  }
};

function addMepHighlight(el, source) {
  let { manifestId } = source.dataset;
  if (!manifestId) {
    const closestManifestId = source?.closest('[data-manifest-id]');
    if (closestManifestId) manifestId = closestManifestId.dataset.manifestId;
  }
  if (manifestId) el.dataset.manifestId = manifestId;
  return el;
}

function toFragment(htmlStrings, ...values) {
  const templateStr = htmlStrings.reduce((acc, htmlString, index) => {
    if (values[index] instanceof HTMLElement) {
      return `${acc + htmlString}<elem ref="${index}"></elem>`;
    }
    return acc + htmlString + (values[index] || '');
  }, '');

  const fragment = document.createRange().createContextualFragment(templateStr).children[0];

  Array.prototype.map.call(fragment.querySelectorAll('elem'), (replaceable) => {
    const ref = replaceable.getAttribute('ref');
    replaceable.replaceWith(values[ref]);
  });

  return fragment;
}

// TODO we might eventually want to move this to the milo core utilities
let federatedContentRoot;
const getFederatedContentRoot = () => {
  if (federatedContentRoot) return federatedContentRoot;

  const { origin } = window.location;

  federatedContentRoot = allowedOrigins.some((o) => origin.replace('.stage', '') === o)
    ? origin
    : 'https://www.adobe.com';

  if (origin.includes('localhost') || origin.includes('.hlx.')) {
    // Akamai as proxy to avoid 401s, given AEM-EDS MS auth cross project limitations
    federatedContentRoot = origin.includes('.hlx.live')
      ? 'https://main--federal--adobecom.hlx.live'
      : 'https://www.stage.adobe.com';
  }

  return federatedContentRoot;
};

// TODO we should match the akamai patterns /locale/federal/ at the start of the url
// and make the check more strict.
const getFederatedUrl = (url = '') => {
  if (typeof url !== 'string' || !url.includes('/federal/')) return url;
  if (url.startsWith('/')) return `${getFederatedContentRoot()}${url}`;
  try {
    const { pathname, search, hash } = new URL(url);
    return `${getFederatedContentRoot()}${pathname}${search}${hash}`;
  } catch (e) {
    lanaLog({ message: `getFederatedUrl errored parsing the URL: ${url}`, e, tags: 'errorType=warn,module=utilities' });
  }
  return url;
};

const getPath = (urlOrPath = '') => {
  try {
    const url = new URL(urlOrPath);
    return url.pathname;
  } catch (error) {
    return urlOrPath.replace(/^\.\//, '/');
  }
};

const federatePictureSources = ({ section, forceFederate } = {}) => {
  const selector = forceFederate
    ? '[src], [srcset]'
    : `[src*="/${FEDERAL_PATH_KEY}/"], [srcset*="/${FEDERAL_PATH_KEY}/"]`;
  section?.querySelectorAll(selector)
    .forEach((source) => {
      const type = source.hasAttribute('src') ? 'src' : 'srcset';
      const path = getPath(source.getAttribute(type));
      const [, localeOrKeySegment, keyOrPathSegment] = path.split('/');
      if (forceFederate || [localeOrKeySegment, keyOrPathSegment].includes(FEDERAL_PATH_KEY)) {
        const federalPrefix = path.includes('/federal/') ? '' : '/federal';
        source.setAttribute(type, `${getFederatedContentRoot()}${federalPrefix}${path}`);
      }
    });
};

let fedsPlaceholderConfig;
const getFedsPlaceholderConfig = ({ useCache = true } = {}) => {
  if (useCache && fedsPlaceholderConfig) return fedsPlaceholderConfig;

  const { locale } = getConfig$1();
  const libOrigin = getFederatedContentRoot();

  fedsPlaceholderConfig = {
    locale: {
      ...locale,
      contentRoot: `${libOrigin}${locale.prefix}/federal/globalnav`,
    },
  };

  return fedsPlaceholderConfig;
};

function getAnalyticsValue(str, index) {
  if (typeof str !== 'string' || !str.length) return str;

  let analyticsValue = processTrackingLabels(str, getConfig$1(), 30);
  analyticsValue = typeof index === 'number' ? `${analyticsValue}-${index}` : analyticsValue;

  return analyticsValue;
}

function getExperienceName() {
  const experiencePath = getMetadata$4('gnav-source');
  const explicitExperience = experiencePath?.split('/').pop();
  if (explicitExperience?.length
    && explicitExperience !== 'gnav') return explicitExperience;

  const { imsClientId } = getConfig$1();
  if (imsClientId?.length) return imsClientId;

  return '';
}

function loadStyles(path) {
  const { miloLibs, codeRoot } = getConfig$1();
  return new Promise((resolve) => {
    loadStyle$2(`${miloLibs || codeRoot}/blocks/global-navigation/${path}`, resolve);
  });
}

// Base styles are shared between top navigation and footer,
// since they can be independent of each other.
// CSS imports were not used due to duplication of file include
async function loadBaseStyles() {
  await loadStyles('base.css');
}

function loadBlock$1(path) {
  return import(path).then((module) => module.default);
}

let cachedDecorateMenu;
async function loadDecorateMenu() {
  if (cachedDecorateMenu) return cachedDecorateMenu;

  let resolve;
  cachedDecorateMenu = new Promise((_resolve) => {
    resolve = _resolve;
  });

  const [{ decorateMenu, decorateLinkGroup }] = await Promise.all([
    loadBlock$1('./menu/menu.js'),
    loadStyles('utilities/menu/menu.css'),
  ]);

  resolve({
    decorateMenu,
    decorateLinkGroup,
  });
  return cachedDecorateMenu;
}

function decorateCta({ elem, type = 'primaryCta', index } = {}) {
  const modifier = type === 'secondaryCta' ? 'secondary' : 'primary';

  const clone = elem.cloneNode(true);
  clone.className = `feds-cta feds-cta--${modifier}`;
  clone.setAttribute('daa-ll', getAnalyticsValue(clone.textContent, index));

  return toFragment`
    <div class="feds-cta-wrapper">
      ${clone}
    </div>`;
}

let curtainElem;
function setCurtainState(state) {
  if (typeof state !== 'boolean') return;

  curtainElem = curtainElem || document.querySelector(selectors.curtain);
  if (curtainElem) curtainElem.classList.toggle('feds-curtain--open', state);
}

const isDesktop = window.matchMedia('(min-width: 900px)');
const isTangentToViewport = window.matchMedia('(min-width: 900px) and (max-width: 1440px)');

function setActiveDropdown(elem) {
  const activeClass = selectors.activeDropdown.replace('.', '');

  // We always need to reset all active dropdowns at first
  const resetActiveDropdown = () => {
    [...document.querySelectorAll(selectors.activeDropdown)]
      .forEach((activeDropdown) => activeDropdown.classList.remove(activeClass));
  };
  resetActiveDropdown();

  // If no elem is provided, de-activating all dropdowns is enough
  if (!(elem instanceof HTMLElement)) return;

  // Compose an array of parents that could be active dropdowns
  const selectorArr = [selectors.menuSection, selectors.menuColumn, selectors.navItem];

  // Look for the first parent that fits the active dropdown criteria
  selectorArr.some((selector) => {
    const closestSection = elem.closest(selector);

    if (closestSection && closestSection.querySelector('[aria-expanded = "true"]')) {
      closestSection.classList.add(activeClass);
      return true;
    }

    return false;
  });
}

const [hasActiveLink, setActiveLink, getActiveLink] = (() => {
  let activeLinkFound;

  return [
    () => activeLinkFound,
    (val) => { activeLinkFound = !!val; },
    (area) => {
      if (hasActiveLink() || !(area instanceof HTMLElement)) return null;
      const { origin, pathname } = window.location;
      const url = `${origin}${pathname}`;
      const activeLink = [
        ...area.querySelectorAll('a:not([data-modal-hash])'),
      ].find((el) => (el.href === url || el.href.startsWith(`${url}?`) || el.href.startsWith(`${url}#`)));

      if (!activeLink) return null;

      setActiveLink(true);
      return activeLink;
    },
  ];
})();

function closeAllDropdowns({ type } = {}) {
  const selector = type === 'headline'
    ? '.feds-menu-headline[aria-expanded="true"]'
    : `${selectors.globalNav} [aria-expanded='true']`;
  const openElements = document.querySelectorAll(selector);
  if (!openElements) return;
  [...openElements].forEach((el) => {
    if ('fedsPreventautoclose' in el.dataset) return;
    el.setAttribute('aria-expanded', 'false');
  });

  setActiveDropdown();

  if (isDesktop.matches) setCurtainState(false);
}

function trigger({ element, event, type } = {}) {
  if (event) event.preventDefault();
  const isOpen = element?.getAttribute('aria-expanded') === 'true';
  closeAllDropdowns({ type });
  if (isOpen) return false;
  element.setAttribute('aria-expanded', 'true');
  return true;
}

const yieldToMain = () => new Promise((resolve) => { setTimeout(resolve, 0); });

async function fetchAndProcessPlainHtml({ url, shouldDecorateLinks = true } = {}) {
  let path = getFederatedUrl(url);
  const mepGnav = getConfig$1()?.mep?.inBlock?.['global-navigation'];
  const mepFragment = mepGnav?.fragments?.[path];
  if (mepFragment && mepFragment.action === 'replace') {
    path = mepFragment.target;
  }
  const res = await fetch(path.replace(/(\.html$|$)/, '.plain.html'));
  const text = await res.text();
  const { body } = new DOMParser().parseFromString(text, 'text/html');
  if (mepFragment?.manifestId) body.dataset.manifestId = mepFragment.manifestId;
  const commands = mepGnav?.commands;
  if (commands?.length) {
    const { handleCommands, deleteMarkedEls } = await Promise.resolve().then(() => personalization);
    handleCommands(commands, body, true);
    deleteMarkedEls(body);
  }
  const inlineFrags = [...body.querySelectorAll('a[href*="#_inline"]')];
  if (inlineFrags.length) {
    const { default: loadInlineFrags } = await Promise.resolve().then(() => fragment);
    const fragPromises = inlineFrags.map((link) => {
      link.href = getFederatedUrl(localizeLink(link.href));
      return loadInlineFrags(link);
    });
    await Promise.all(fragPromises);
  }

  // federatePictureSources should only be called after decorating the links.
  if (shouldDecorateLinks) {
    decorateLinks(body);
    federatePictureSources({ section: body, forceFederate: path.includes('/federal/') });
  }

  const blocks = body.querySelectorAll('.martech-metadata');
  if (blocks.length) {
    Promise.resolve().then(() => martechMetadata)
      .then(({ default: decorate }) => blocks.forEach((block) => decorate(block)));
  }

  body.innerHTML = await replaceText(body.innerHTML, getFedsPlaceholderConfig());
  return body;
}

const [setUserProfile, getUserProfile] = (() => {
  let profileData;
  let profileResolve;
  let profileTimeout;

  const profilePromise = new Promise((resolve) => {
    profileResolve = resolve;

    profileTimeout = setTimeout(() => {
      profileData = {};
      resolve(profileData);
    }, 5000);
  });

  return [
    (data) => {
      if (data && !profileData) {
        profileData = data;
        clearTimeout(profileTimeout);
        profileResolve(profileData);
      }
    },
    () => profilePromise,
  ];
})();

/* eslint-disable no-async-promise-executor */

const CONFIG$1 = {
  icons: icons$1,
  delays: {
    mainNavDropdowns: 800,
    loadDelayed: 3000,
    keyboardNav: 8000,
  },
  features: [
    'gnav-brand',
    'gnav-promo',
    'search',
    'profile',
    'app-launcher',
    'adobe-logo',
  ],
  universalNav: {
    components: {
      profile: {
        name: 'profile',
        attributes: {
          isSignUpRequired: false,
          componentLoaderConfig: {
            config: {
              enableLocalSection: true,
              miniAppContext: {
                onMessage: (name, payload) => {
                  if (name === 'System' && payload.subType === 'AppInitiated') {
                    window.adobeProfile?.getUserProfile()
                      .then((data) => { setUserProfile(data); })
                      .catch(() => { setUserProfile({}); });
                  }
                },
                logger: {
                  trace: () => {},
                  debug: () => {},
                  info: () => {},
                  warn: (e) => lanaLog({ message: 'Profile Menu warning', e, tags: 'errorType=warn,module=universalnav' }),
                  error: (e) => lanaLog({ message: 'Profile Menu error', e, tags: 'errorType=error,module=universalnav' }),
                },
              },
            },
          },
          callbacks: {
            onSignIn: () => { window.adobeIMS?.signIn(); },
            onSignUp: () => { window.adobeIMS?.signIn(); },
          },
        },
      },
      appswitcher: { name: 'app-switcher' },
      notifications: {
        name: 'notifications',
        attributes: { notificationsConfig: { applicationContext: { appID: 'adobecom' } } },
      },
      help: {
        name: 'help',
        attributes: {
          children: [
            { type: 'Support' },
            { type: 'Community' },
            // { type: 'Jarvis', appid: window.adobeid?.client_id },
          ],
        },
      },
    },
  },
};

const osMap = {
  Mac: 'macOS',
  Win: 'windows',
  Linux: 'linux',
  CrOS: 'chromeOS',
  Android: 'android',
  iPad: 'iPadOS',
  iPhone: 'iOS',
};

const LANGMAP = {
  cs: ['cz'],
  da: ['dk'],
  de: ['at'],
  en: ['africa', 'au', 'ca', 'ie', 'in', 'mt', 'ng', 'nz', 'sg', 'za'],
  es: ['ar', 'cl', 'co', 'cr', 'ec', 'gt', 'la', 'mx', 'pe', 'pr'],
  et: ['ee'],
  ja: ['jp'],
  ko: ['kr'],
  nb: ['no'],
  pt: ['br'],
  sl: ['si'],
  sv: ['se'],
  uk: ['ua'],
  zh: ['cn', 'tw'],
};

// signIn, decorateSignIn and decorateProfileTrigger can be removed if IMS takes over the profile
const signIn = () => {
  if (typeof window.adobeIMS?.signIn !== 'function') {
    lanaLog({ message: 'IMS signIn method not available', tags: 'errorType=warn,module=gnav' });
    return;
  }

  window.adobeIMS.signIn();
};

const decorateSignIn = async ({ rawElem, decoratedElem }) => {
  const dropdownElem = rawElem.querySelector(':scope > div:nth-child(2)');
  const signInLabel = await replaceKey('sign-in', getFedsPlaceholderConfig());
  let signInElem;

  if (!dropdownElem) {
    signInElem = toFragment`<button daa-ll="${signInLabel}" class="feds-signIn">${signInLabel}</button>`;

    signInElem.addEventListener('click', (e) => {
      e.preventDefault();
      signIn();
    });
  } else {
    signInElem = toFragment`<button daa-ll="${signInLabel}" class="feds-signIn" aria-expanded="false" aria-haspopup="true">${signInLabel}</button>`;

    signInElem.addEventListener('click', (e) => trigger({ element: signInElem, event: e }));
    signInElem.addEventListener('keydown', (e) => e.code === 'Escape' && closeAllDropdowns());
    dropdownElem.addEventListener('keydown', (e) => e.code === 'Escape' && closeAllDropdowns());

    dropdownElem.classList.add('feds-signIn-dropdown');

    const dropdownSignInAnchor = dropdownElem.querySelector('[href$="?sign-in=true"]');
    if (dropdownSignInAnchor) {
      const dropdownSignInButton = toFragment`<button class="feds-signIn">${dropdownSignInAnchor.textContent}</button>`;
      dropdownSignInAnchor.replaceWith(dropdownSignInButton);
      dropdownSignInButton.addEventListener('click', (e) => {
        e.preventDefault();
        signIn();
      });
    } else {
      lanaLog({ message: 'Sign in link not found in dropdown.', tags: 'errorType=warn,module=gnav' });
    }

    decoratedElem.append(dropdownElem);
  }

  decoratedElem.prepend(signInElem);
};

const decorateProfileTrigger = async ({ avatar }) => {
  const [label, profileAvatar] = await replaceKeyArray(
    ['profile-button', 'profile-avatar'],
    getFedsPlaceholderConfig(),
  );

  const buttonElem = toFragment`
    <button
      class="feds-profile-button"
      aria-expanded="false"
      aria-controls="feds-profile-menu"
      aria-label="${label}"
      daa-ll="Account"
      aria-haspopup="true"
    >
      <img class="feds-profile-img" src="${avatar}" alt="${profileAvatar}"></img>
    </button>
  `;

  return buttonElem;
};

let keyboardNav;
const setupKeyboardNav = async () => {
  keyboardNav = keyboardNav || new Promise(async (resolve) => {
    const KeyboardNavigation = await loadBlock$1('https://main--milo--adobecom.hlx.page/libs/blocks/global-navigation/utilities/keyboard/index.js');
    const instance = new KeyboardNavigation();
    resolve(instance);
  });
};

const getBrandImage = (image) => {
  // Return the default Adobe logo if an image is not available
  if (!image) return CONFIG$1.icons.company;

  // Try to decorate image as PNG, JPG or JPEG
  const imgText = image?.textContent || '';
  const [source, alt] = imgText.split('|');
  if (source.trim().length) {
    const img = toFragment`<img src="${source.trim()}" />`;
    if (alt) img.alt = alt.trim();
    return img;
  }

  // Return the default Adobe logo if the image could not be decorated
  return CONFIG$1.icons.company;
};

const closeOnClickOutside = (e) => {
  if (!isDesktop.matches) return;

  const openElemSelector = `${selectors.globalNav} [aria-expanded = "true"]`;
  const isClickedElemOpen = [...document.querySelectorAll(openElemSelector)]
    .find((openItem) => openItem.parentElement.contains(e.target));

  if (!isClickedElemOpen) {
    closeAllDropdowns();
  }
};

const getUniversalNavLocale = (locale) => {
  if (!locale.prefix || locale.prefix === '/') return 'en_US';
  const prefix = locale.prefix.replace('/', '');
  if (prefix.includes('_')) {
    const [lang, country] = prefix.split('_').reverse();
    return `${lang.toLowerCase()}_${country.toUpperCase()}`;
  }

  if (prefix === 'uk') return 'en_GB';
  const customLang = Object.keys(LANGMAP).find((key) => LANGMAP[key].includes(prefix));
  if (customLang) return `${customLang.toLowerCase()}_${prefix.toUpperCase()}`;

  return `${prefix.toLowerCase()}_${prefix.toUpperCase()}`;
};

const convertToPascalCase = (str) => str
  ?.split('-')
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join(' ');

class Gnav {
  constructor({ content, block } = {}) {
    this.content = content;
    this.block = block;

    this.blocks = {
      profile: {
        rawElem: this.content.querySelector('.profile'),
        decoratedElem: toFragment`<div class="feds-profile"></div>`,
      },
      search: { config: { icon: CONFIG$1.icons.search } },
      breadcrumbs: { wrapper: '' },
    };

    this.setupUniversalNav();
    this.elements = {};
  }

  setupUniversalNav = () => {
    const meta = getMetadata$4('universal-nav')?.toLowerCase();
    this.universalNavComponents = meta?.split(',').map((option) => option.trim())
      .filter((component) => Object.keys(CONFIG$1.universalNav.components).includes(component) || component === 'signup');
    this.useUniversalNav = meta === 'on' || !!this.universalNavComponents?.length;
    if (this.useUniversalNav) {
      delete this.blocks.profile;
      this.blocks.universalNav = toFragment`<div class="feds-utilities"></div>`;
      this.blocks.universalNav.addEventListener('click', () => {
        if (this.isToggleExpanded()) this.toggleMenuMobile();
      }, true);
    }
  };

  init = () => logErrorFor(async () => {
    this.elements.curtain = toFragment`<div class="feds-curtain"></div>`;

    // Order is important, decorateTopnavWrapper will render the nav
    // Ensure any critical task is executed before it
    const tasks = [
      loadBaseStyles,
      this.decorateMainNav,
      this.decorateTopNav,
      this.decorateAside,
      this.decorateTopnavWrapper,
      this.ims,
      this.addChangeEventListeners,
    ];
    this.block.addEventListener('click', this.loadDelayed);
    this.block.addEventListener('keydown', setupKeyboardNav);
    setTimeout(this.loadDelayed, CONFIG$1.delays.loadDelayed);
    setTimeout(setupKeyboardNav, CONFIG$1.delays.keyboardNav);
    for await (const task of tasks) {
      await yieldToMain();
      await task();
    }

    document.addEventListener('click', closeOnClickOutside);
    isDesktop.addEventListener('change', closeAllDropdowns);
  }, 'Error in global navigation init', 'errorType=error,module=gnav');

  ims = async () => loadIms()
    .then(() => this.imsReady())
    .catch((e) => {
      if (e?.message === 'IMS timeout') {
        window.addEventListener('onImsLibInstance', () => this.imsReady());
        return;
      }
      lanaLog({ message: 'GNAV: Error with IMS', e, tags: 'errorType=info,module=gnav' });
    });

  decorateTopNav = () => {
    this.elements.mobileToggle = this.decorateToggle();
    this.elements.topnav = toFragment`
      <nav class="feds-topnav" aria-label="Main">
        <div class="feds-brand-container">
          ${this.elements.mobileToggle}
          ${this.decorateBrand()}
        </div>
        ${this.elements.navWrapper}
        ${this.useUniversalNav ? this.blocks.universalNav : ''}
        ${(!this.useUniversalNav && this.blocks.profile.rawElem) ? this.blocks.profile.decoratedElem : ''}
        ${this.decorateLogo()}
      </nav>
    `;
  };

  decorateTopnavWrapper = async () => {
    const breadcrumbs = isDesktop.matches ? await this.decorateBreadcrumbs() : '';
    this.elements.topnavWrapper = toFragment`<div class="feds-topnav-wrapper">
        ${this.elements.topnav}
        ${breadcrumbs}
      </div>`;

    this.block.append(this.elements.curtain, this.elements.aside, this.elements.topnavWrapper);
  };

  addChangeEventListeners = () => {
    // Ensure correct DOM order for elements between mobile and desktop
    isDesktop.addEventListener('change', () => {
      if (isDesktop.matches) {
        // On desktop, search is after nav
        if (this.elements.mainNav instanceof HTMLElement
          && this.elements.search instanceof HTMLElement) {
          this.elements.mainNav.after(this.elements.search);
        }

        // On desktop, breadcrumbs are below the whole nav
        if (this.elements.topnav instanceof HTMLElement
          && this.elements.breadcrumbsWrapper instanceof HTMLElement) {
          this.elements.topnav.after(this.elements.breadcrumbsWrapper);
        }
      } else {
        // On mobile, nav is after search
        if (this.elements.mainNav instanceof HTMLElement
          && this.elements.search instanceof HTMLElement) {
          this.elements.mainNav.before(this.elements.search);
        }

        // On mobile, breadcrumbs are before the search and nav
        if (this.elements.navWrapper instanceof HTMLElement
          && this.elements.breadcrumbsWrapper instanceof HTMLElement) {
          this.elements.navWrapper.prepend(this.elements.breadcrumbsWrapper);
        }
      }
    });

    // Add a modifier when the nav is tangent to the viewport and content is partly hidden
    const toggleContraction = () => {
      const isOverflowing = isTangentToViewport.matches
        && this.elements.topnav?.scrollWidth
        && this.elements.topnav.scrollWidth > document.body.clientWidth;

      this.elements.topnav.classList.toggle(selectors.overflowingTopNav.slice(1), isOverflowing);
      window.dispatchEvent(new CustomEvent('feds:navOverflow', { detail: { isOverflowing } }));
    };

    toggleContraction();
    isTangentToViewport.addEventListener('change', toggleContraction);
  };

  loadDelayed = async () => {
    this.ready = this.ready || new Promise(async (resolve) => {
      try {
        this.block.removeEventListener('click', this.loadDelayed);
        this.block.removeEventListener('keydown', this.loadDelayed);
        const [
          Search,
        ] = await Promise.all([
          loadBlock$1('https://main--milo--adobecom.hlx.page/libs/blocks/global-navigation/features/search/gnav-search.js'),
          loadStyles('https://main--milo--adobecom.hlx.page/libs/blocks/global-navigation/features/search/gnav-search.css'),
        ]);
        this.Search = Search;

        if (!this.useUniversalNav) {
          const [ProfileDropdown] = await Promise.all([
            loadBlock$1('../features/profile/dropdown.js'),
            loadStyles('features/profile/dropdown.css'),
          ]);
          this.ProfileDropdown = ProfileDropdown;
        }

        resolve();
      } catch (e) {
        lanaLog({ message: 'GNAV: Error within loadDelayed', e, tags: 'errorType=warn,module=gnav' });
        resolve();
      }
    });

    return this.ready;
  };

  imsReady = async () => {
    if (!window.adobeIMS.isSignedInUser() || !this.useUniversalNav) setUserProfile({});

    const tasks = [this.useUniversalNav ? this.decorateUniversalNav : this.decorateProfile];

    try {
      for await (const task of tasks) {
        await yieldToMain();
        await task();
      }
    } catch (e) {
      lanaLog({ message: 'GNAV: issues within onReady', e, tags: 'errorType=info,module=gnav' });
    }
  };

  decorateProfile = async () => {
    const { rawElem, decoratedElem } = this.blocks.profile;
    if (!rawElem) return;

    const isSignedInUser = window.adobeIMS.isSignedInUser();

    // If user is not signed in, decorate the 'Sign In' element
    if (!isSignedInUser) {
      await decorateSignIn({ rawElem, decoratedElem });
      return;
    }

    // If user is signed in, decorate the profile avatar
    const accessToken = window.adobeIMS.getAccessToken();
    const { env } = getConfig$1();
    const headers = new Headers({ Authorization: `Bearer ${accessToken.token}` });
    const profileData = await fetch(`https://${env.adobeIO}/profile`, { headers });

    if (profileData.status !== 200) {
      return;
    }

    const { sections, user: { avatar } } = await profileData.json();

    this.blocks.profile.buttonElem = await decorateProfileTrigger({ avatar });
    decoratedElem.append(this.blocks.profile.buttonElem);

    // Decorate the profile dropdown
    // after user interacts with button or after 3s have passed
    let decorationTimeout;

    const decorateDropdown = async (e) => {
      this.blocks.profile.buttonElem.removeEventListener('click', decorateDropdown);
      clearTimeout(decorationTimeout);
      await this.loadDelayed();
      this.blocks.profile.dropdownInstance = new this.ProfileDropdown({
        rawElem,
        decoratedElem,
        avatar,
        sections,
        buttonElem: this.blocks.profile.buttonElem,
        // If the dropdown has been decorated due to a click, open it
        openOnInit: e instanceof Event,
      });
    };

    this.blocks.profile.buttonElem.addEventListener('click', decorateDropdown);
    decorationTimeout = setTimeout(decorateDropdown, CONFIG$1.delays.loadDelayed);
  };

  decorateUniversalNav = async () => {
    const config = getConfig$1();
    const locale = getUniversalNavLocale(config.locale);
    const environment = config.env.name === 'prod' ? 'prod' : 'stage';
    const visitorGuid = window.alloy ? await window.alloy('getIdentity')
      .then((data) => data?.identity?.ECID).catch(() => undefined) : undefined;
    const experienceName = getExperienceName();

    const getDevice = () => {
      const agent = navigator.userAgent;
      for (const [os, osName] of Object.entries(osMap)) {
        if (agent.includes(os)) return osName;
      }
      return 'linux';
    };

    await Promise.all([
      loadScript$1(`https://${environment}.adobeccstatic.com/unav/1.1/UniversalNav.js`),
      loadStyle$2(`https://${environment}.adobeccstatic.com/unav/1.1/UniversalNav.css`),
    ]);

    const getChildren = () => {
      const children = [CONFIG$1.universalNav.components.profile];
      // reset sign up value on change
      children[0].attributes.isSignUpRequired = false;

      this.universalNavComponents?.forEach((component) => {
        if (component === 'profile') return;
        if (component === 'signup') {
          children[0].attributes.isSignUpRequired = true;
          return;
        }

        children.push(CONFIG$1.universalNav.components[component]);
      });

      return children;
    };

    const onAnalyticsEvent = (data) => {
      if (!data) return;
      if (!data.event) data.event = { type: data.type, subtype: data.subtype };
      if (!data.source) data.source = { name: data.workflow?.toLowerCase().trim() };

      const getInteraction = () => {
        const {
          event: { type, subtype } = {},
          source: { name } = {},
          content: { name: contentName } = {},
        } = data;

        switch (`${name}|${type}|${subtype}${contentName ? `|${contentName}` : ''}`) {
          case 'profile|click|sign-in':
            return `Sign In|gnav|${experienceName}|unav`;
          case 'profile|render|component':
            return `Account|gnav|${experienceName}|unav`;
          case 'profile|click|account':
            return `View Account|gnav|${experienceName}|unav`;
          case 'profile|click|sign-out':
            return `Sign Out|gnav|${experienceName}|unav`;
          case 'app-switcher|render|component':
            return 'AppLauncher.appIconToggle';
          case `app-switcher|click|app|${contentName}`:
            return `AppLauncher.appClick.${convertToPascalCase(contentName)}`;
          case 'app-switcher|click|footer|adobe-home':
            return 'AppLauncher.adobe.com';
          case 'app-switcher|click|footer|all-apps':
            return 'AppLauncher.allapps';
          case 'app-switcher|click|footer|adobe-dot-com':
            return 'AppLauncher.adobe.com';
          case 'app-switcher|click|footer|see-all-apps':
            return 'AppLauncher.allapps';
          case 'unc|click|icon':
            return 'Open Notifications panel';
          case 'unc|click|link':
            return 'Open Notification';
          case 'unc|click|markRead':
            return 'Mark Notification as read';
          case 'unc|click|dismiss':
            return 'Dismiss Notifications';
          case 'unc|click|markUnread':
            return 'Mark Notification as unread';
          default:
            return null;
        }
      };
      const interaction = getInteraction();

      if (!interaction) return;
      // eslint-disable-next-line no-underscore-dangle
      window._satellite?.track('event', {
        xdm: {},
        data: { web: { webInteraction: { name: interaction } } },
      });
    };

    const getConfiguration = () => ({
      target: this.blocks.universalNav,
      env: environment,
      locale,
      imsClientId: window.adobeid?.client_id,
      theme: 'light',
      onReady: () => {
        this.decorateAppPrompt({ getAnchorState: () => window.UniversalNav.getComponent?.('app-switcher') });
      },
      analyticsContext: {
        consumer: {
          name: 'adobecom',
          version: '1.0',
          platform: 'Web',
          device: getDevice(),
          os_version: navigator.platform,
        },
        event: { visitor_guid: visitorGuid },
        onAnalyticsEvent,
      },
      children: getChildren(),
    });

    window.UniversalNav(getConfiguration());

    isDesktop.addEventListener('change', () => {
      window.UniversalNav.reload(getConfiguration());
    });
  };

  decorateAppPrompt = async ({ getAnchorState } = {}) => {
    const state = getMetadata$4('app-prompt')?.toLowerCase();
    const entName = getMetadata$4('app-prompt-entitlement')?.toLowerCase();
    const promptPath = getMetadata$4('app-prompt-path')?.toLowerCase();
    if (state === 'off'
      || !window.adobeIMS?.isSignedInUser()
      || !isDesktop.matches
      || !entName?.length
      || !promptPath?.length) return;

    const { base } = getConfig$1();
    const [
      webappPrompt$1,
    ] = await Promise.all([
      Promise.resolve().then(() => webappPrompt),
      loadStyle$2(`${base}/features/webapp-prompt/webapp-prompt.css`),
    ]);

    webappPrompt$1.default({ promptPath, entName, parent: this.blocks.universalNav, getAnchorState });
  };

  loadSearch = () => {
    if (this.blocks?.search?.instance) return null;

    return this.loadDelayed().then(() => {
      this.blocks.search.instance = new this.Search(this.blocks.search.config);
    }).catch(() => {});
  };

  isToggleExpanded = () => this.elements.mobileToggle?.getAttribute('aria-expanded') === 'true';

  toggleMenuMobile = () => {
    const toggle = this.elements.mobileToggle;
    const isExpanded = this.isToggleExpanded();
    toggle?.setAttribute('aria-expanded', !isExpanded);
    this.elements.navWrapper?.classList?.toggle('feds-nav-wrapper--expanded', !isExpanded);
    closeAllDropdowns();
    setCurtainState(!isExpanded);
    toggle?.setAttribute('daa-ll', `hamburgermenu|${isExpanded ? 'open' : 'close'}`);
  };

  decorateToggle = () => {
    if (!this.mainNavItemCount) return '';

    const toggle = toFragment`<button
      class="feds-toggle"
      daa-ll="hamburgermenu|open"
      aria-expanded="false"
      aria-haspopup="true"
      aria-label="Navigation menu"
      aria-controls="feds-nav-wrapper"
      data-feds-preventAutoClose>
      </button>`;

    const setHamburgerPadding = () => {
      if (isDesktop.matches) {
        this.elements.mainNav.style.removeProperty('padding-bottom');
      } else {
        const offset = Math.ceil(this.elements.topnavWrapper.getBoundingClientRect().bottom);
        this.elements.mainNav.style.setProperty('padding-bottom', `${offset}px`);
      }
    };

    const onToggleClick = async () => {
      this.toggleMenuMobile();

      if (this.blocks?.search?.instance) {
        this.blocks.search.instance.clearSearchForm();
      } else {
        await this.loadSearch();
      }

      if (this.isToggleExpanded()) setHamburgerPadding();
    };

    toggle.addEventListener('click', () => logErrorFor(onToggleClick, 'Toggle click failed', 'errorType=error,module=gnav'));

    const onDeviceChange = () => {
      if (isDesktop.matches) {
        toggle.setAttribute('aria-expanded', false);
        this.elements.navWrapper.classList.remove('feds-nav-wrapper--expanded');
        setCurtainState(false);
        closeAllDropdowns();
        this.blocks?.search?.instance?.clearSearchForm();
      }
    };

    isDesktop.addEventListener('change', () => logErrorFor(onDeviceChange, 'Toggle logic failed on device change', 'errorType=error,module=gnav'));

    return toggle;
  };

  decorateGenericLogo = ({ selector, classPrefix, includeLabel = true, analyticsValue } = {}) => {
    const rawBlock = this.content.querySelector(selector);
    if (!rawBlock) return '';

    // Get all non-image links
    const imgRegex = /(\.png|\.jpg|\.jpeg)/;
    const blockLinks = [...rawBlock.querySelectorAll('a')];
    const link = blockLinks.find((blockLink) => !imgRegex.test(blockLink.href)
      && !imgRegex.test(blockLink.textContent));

    if (!link) return '';

    // Check which elements should be rendered
    const renderImage = !rawBlock.matches('.no-logo');
    const renderLabel = includeLabel && !rawBlock.matches('.image-only');

    if (!renderImage && !renderLabel) return '';

    // Create image element
    const getImageEl = () => {
      const svgImg = rawBlock.querySelector('picture img[src$=".svg"]');
      if (svgImg) return svgImg;

      const image = blockLinks.find((blockLink) => imgRegex.test(blockLink.href)
        || imgRegex.test(blockLink.textContent));
      return getBrandImage(image);
    };

    const imageEl = renderImage
      ? toFragment`<span class="${classPrefix}-image">${getImageEl()}</span>`
      : '';

    // Create label element
    const labelEl = renderLabel
      ? toFragment`<span class="${classPrefix}-label">${link.textContent}</span>`
      : '';

    // Create final template
    const decoratedElem = toFragment`
      <a href="${link.href}" class="${classPrefix}" daa-ll="${analyticsValue}">
        ${imageEl}
        ${labelEl}
      </a>`;

    // Add accessibility attributes if just an image is rendered
    if (!renderLabel && link.textContent.length) decoratedElem.setAttribute('aria-label', link.textContent);

    return decoratedElem;
  };

  decorateAside = async () => {
    this.elements.aside = '';
    const promoPath = getMetadata$4('gnav-promo-source');
    if (!isDesktop.matches || !promoPath) {
      this.block.classList.remove('has-promo');
      return this.elements.aside;
    }

    const { default: decorate } = await Promise.resolve().then(() => aside);
    if (!decorate) return this.elements.aside;
    this.elements.aside = await decorate({ headerElem: this.block, promoPath });
    return this.elements.aside;
  };

  decorateBrand = () => this.decorateGenericLogo({
    selector: '.gnav-brand',
    classPrefix: 'feds-brand',
    analyticsValue: 'Brand',
  });

  decorateLogo = () => this.decorateGenericLogo({
    selector: '.adobe-logo',
    classPrefix: 'feds-logo',
    includeLabel: false,
    analyticsValue: 'Logo',
  });

  decorateMainNav = async () => {
    const breadcrumbs = isDesktop.matches ? '' : await this.decorateBreadcrumbs();
    this.elements.mainNav = toFragment`<div class="feds-nav"></div>`;
    this.elements.navWrapper = toFragment`
      <div class="feds-nav-wrapper" id="feds-nav-wrapper">
        ${breadcrumbs}
        ${isDesktop.matches ? '' : this.decorateSearch()}
        ${this.elements.mainNav}
        ${isDesktop.matches ? this.decorateSearch() : ''}
      </div>
    `;

    // Get all main menu items, but exclude any that are nested inside other features
    const items = [...this.content.querySelectorAll('h2, p:only-child > strong > a, p:only-child > em > a')]
      .filter((item) => CONFIG$1.features.every((feature) => !item.closest(`.${feature}`)));

    // Save number of items to decide whether a hamburger menu is required
    this.mainNavItemCount = items.length;

    for await (const [index, item] of items.entries()) {
      await yieldToMain();
      this.elements.mainNav.appendChild(this.decorateMainNavItem(item, index));
    }

    if (!hasActiveLink()) {
      const sections = this.elements.mainNav.querySelectorAll('.feds-navItem--section');

      if (sections.length === 1) {
        sections[0].classList.add(selectors.activeNavItem.slice(1));
        setActiveLink(true);
      }
    }

    return this.elements.mainNav;
  };

  // eslint-disable-next-line class-methods-use-this
  getMainNavItemType = (item) => {
    const itemTopParent = item.closest('div');
    const hasSyncDropdown = itemTopParent instanceof HTMLElement
      && itemTopParent.childElementCount > 1;
    if (hasSyncDropdown) return 'syncDropdownTrigger';
    const hasAsyncDropdown = itemTopParent instanceof HTMLElement
      && itemTopParent.closest('.large-menu') instanceof HTMLElement;
    if (hasAsyncDropdown) return 'asyncDropdownTrigger';
    const isPrimaryCta = item.closest('strong') instanceof HTMLElement;
    if (isPrimaryCta) return 'primaryCta';
    const isSecondaryCta = item.closest('em') instanceof HTMLElement;
    if (isSecondaryCta) return 'secondaryCta';
    const isText = !(item.querySelector('a') instanceof HTMLElement);
    if (isText) return 'text';
    return 'link';
  };

  decorateMainNavItem = (item, index) => {
    const itemType = this.getMainNavItemType(item);

    const itemHasActiveLink = ['syncDropdownTrigger', 'link'].includes(itemType)
      && getActiveLink(item.closest('div')) instanceof HTMLElement;
    const activeModifier = itemHasActiveLink ? ` ${selectors.activeNavItem.slice(1)}` : '';

    // All dropdown decoration is delayed
    const delayDropdownDecoration = ({ template } = {}) => {
      let decorationTimeout;

      const decorateDropdown = () => logErrorFor(async () => {
        template.removeEventListener('click', decorateDropdown);
        clearTimeout(decorationTimeout);

        const menuLogic = await loadDecorateMenu();

        menuLogic.decorateMenu({
          item,
          template,
          type: itemType,
        });
      }, 'Decorate dropdown failed', 'errorType=info,module=gnav');

      template.addEventListener('click', decorateDropdown);
      decorationTimeout = setTimeout(decorateDropdown, CONFIG$1.delays.mainNavDropdowns);
    };

    // Decorate item based on its type
    switch (itemType) {
      case 'syncDropdownTrigger':
      case 'asyncDropdownTrigger': {
        const dropdownTrigger = toFragment`<button
          class="feds-navLink feds-navLink--hoverCaret"
          aria-expanded="false"
          aria-haspopup="true"
          daa-ll="${getAnalyticsValue(item.textContent, index + 1)}"
          daa-lh="header|Open">
            ${item.textContent.trim()}
          </button>`;

        const isSectionMenu = item.closest('.section') instanceof HTMLElement;
        const tag = isSectionMenu ? 'section' : 'div';
        const sectionModifier = isSectionMenu ? ' feds-navItem--section' : '';
        const triggerTemplate = toFragment`
          <${tag} class="feds-navItem${sectionModifier}${activeModifier}">
            ${dropdownTrigger}
          </${tag}>`;

        // Toggle trigger's dropdown on click
        dropdownTrigger.addEventListener('click', (e) => {
          trigger({ element: dropdownTrigger, event: e });
          setActiveDropdown(dropdownTrigger);
        });

        // Update analytics value when dropdown is expanded/collapsed
        const observer = new MutationObserver(() => {
          const isExpanded = dropdownTrigger.getAttribute('aria-expanded') === 'true';
          const analyticsValue = `header|${isExpanded ? 'Close' : 'Open'}`;
          dropdownTrigger.setAttribute('daa-lh', analyticsValue);
        });
        observer.observe(dropdownTrigger, { attributeFilter: ['aria-expanded'] });

        delayDropdownDecoration({ template: triggerTemplate });
        return addMepHighlight(triggerTemplate, item);
      }
      case 'primaryCta':
      case 'secondaryCta':
        // Remove its 'em' or 'strong' wrapper
        item.parentElement.replaceWith(item);

        return addMepHighlight(toFragment`<div class="feds-navItem feds-navItem--centered">
            ${decorateCta({ elem: item, type: itemType, index: index + 1 })}
          </div>`, item);
      case 'link': {
        const linkElem = item.querySelector('a');
        linkElem.className = 'feds-navLink';
        linkElem.setAttribute('daa-ll', getAnalyticsValue(linkElem.textContent, index + 1));
        if (itemHasActiveLink) {
          linkElem.removeAttribute('href');
          linkElem.setAttribute('role', 'link');
          linkElem.setAttribute('aria-disabled', 'true');
          linkElem.setAttribute('aria-current', 'page');
          linkElem.setAttribute('tabindex', 0);
        }

        const linkTemplate = toFragment`
          <div class="feds-navItem${activeModifier}">
            ${linkElem}
          </div>`;
        return addMepHighlight(linkTemplate, item);
      }
      case 'text':
        return addMepHighlight(toFragment`<div class="feds-navItem feds-navItem--centered">
            ${item.textContent}
          </div>`, item);
      default:
        /* c8 ignore next 3 */
        return addMepHighlight(toFragment`<div class="feds-navItem feds-navItem--centered">
            ${item}
          </div>`, item);
    }
  };

  decorateBreadcrumbs = async () => {
    if (!this.block.classList.contains('has-breadcrumbs')) return null;
    if (this.elements.breadcrumbsWrapper) return this.elements.breadcrumbsWrapper;
    const breadcrumbsElem = this.block.querySelector('.breadcrumbs');
    // Breadcrumbs are not initially part of the nav, need to decorate the links
    if (breadcrumbsElem) decorateLinks(breadcrumbsElem);
    const createBreadcrumbs = await loadBlock$1('../features/breadcrumbs/breadcrumbs.js');
    this.elements.breadcrumbsWrapper = await createBreadcrumbs(breadcrumbsElem);
    return this.elements.breadcrumbsWrapper;
  };

  decorateSearch = () => {
    const searchBlock = this.content.querySelector('.search');

    if (!searchBlock) return null;

    this.blocks.search.config.trigger = toFragment`
      <button class="feds-search-trigger" aria-label="Search" aria-expanded="false" aria-controls="feds-search-bar" daa-ll="Search">
        ${this.blocks.search.config.icon}
        <span class="feds-search-close"></span>
      </button>`;

    this.elements.search = toFragment`
      <div class="feds-search">
        ${this.blocks.search.config.trigger}
      </div>`;

    // Replace the aria-label value once placeholder is fetched
    replaceKey('search', getFedsPlaceholderConfig()).then((placeholder) => {
      if (placeholder && placeholder.length) {
        this.blocks.search.config.trigger.setAttribute('aria-label', placeholder);
      }
    });

    this.blocks.search.config.trigger.addEventListener('click', async () => {
      await this.loadSearch();
    });

    return this.elements.search;
  };
}

// export const [setCustomConfig, updateCustomConfig, getCustomConfig] = (() => {
//   let customConfig = {};
//   return [
//     (customConf) => {
//       customConfig.autoBlocks = AUTO_BLOCKS; // Still need to check how it can be removed from utils.js#556
//       setupMiloObj(customConfig); // need to check this
//       return customConfig;
//     },
//     (customConf) => (customConfig = customConf),
//     () => customConfig,
//   ];
// })();

 //const initialConfig = {
//   // Provide the necessary initial configuration here
//   origin: window.location.origin,
//   pathname: window.location.pathname,
//   locales: [], // Add your locales here
 //  autoBlocks: AUTO_BLOCKS, // Still need to check how it can be removed from utils.js#556
//   doNotInline: [], // Add your do not inline elements here
//   // Add other configurations as needed
// };

const locales = {
  '': { ietf: 'en-US', tk: 'hah7vzn.css' },
  ae_ar: { ietf: 'ar-AE', tk: 'lpk1hwn.css', dir: 'rtl' },
  ae_en: { ietf: 'en', tk: 'hah7vzn.css' },
  africa: { ietf: 'en', tk: 'hah7vzn.css' },
  ar: { ietf: 'ar', tk: 'lpk1hwn.css', dir: 'rtl' },
  ar_es: { ietf: 'es-AR', tk: 'hah7vzn.css' },
  at: { ietf: 'de-AT', tk: 'hah7vzn.css' },
  au: { ietf: 'en-AU', tk: 'hah7vzn.css' },
  be_en: { ietf: 'en-BE', tk: 'hah7vzn.css' },
  be_fr: { ietf: 'fr-BE', tk: 'hah7vzn.css' },
  be_nl: { ietf: 'nl-BE', tk: 'qxw8hzm.css' },
  bg: { ietf: 'bg-BG', tk: 'qxw8hzm.css' },
  br: { ietf: 'pt-BR', tk: 'hah7vzn.css' },
  ca_fr: { ietf: 'fr-CA', tk: 'hah7vzn.css' },
  ca: { ietf: 'en-CA', tk: 'hah7vzn.css' },
  ch_de: { ietf: 'de-CH', tk: 'hah7vzn.css' },
  ch_fr: { ietf: 'fr-CH', tk: 'hah7vzn.css' },
  ch_it: { ietf: 'it-CH', tk: 'hah7vzn.css' },
  cl: { ietf: 'es-CL', tk: 'hah7vzn.css' },
  cn: { ietf: 'zh-CN', tk: 'qxw8hzm' },
  co: { ietf: 'es-CO', tk: 'hah7vzn.css' },
  cr: { ietf: 'es-419', tk: 'hah7vzn.css' },
  cy_en: { ietf: 'en-CY', tk: 'hah7vzn.css' },
  cz: { ietf: 'cs-CZ', tk: 'qxw8hzm.css' },
  de: { ietf: 'de-DE', tk: 'hah7vzn.css' },
  dk: { ietf: 'da-DK', tk: 'qxw8hzm.css' },
  ec: { ietf: 'es-419', tk: 'hah7vzn.css' },
  ee: { ietf: 'et-EE', tk: 'qxw8hzm.css' },
  eg_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl' },
  eg_en: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  el: { ietf: 'el', tk: 'qxw8hzm.css' },
  es: { ietf: 'es-ES', tk: 'hah7vzn.css' },
  fi: { ietf: 'fi-FI', tk: 'qxw8hzm.css' },
  fr: { ietf: 'fr-FR', tk: 'hah7vzn.css' },
  gr_el: { ietf: 'el', tk: 'qxw8hzm.css' },
  gr_en: { ietf: 'en-GR', tk: 'hah7vzn.css' },
  gt: { ietf: 'es-419', tk: 'hah7vzn.css' },
  hk_en: { ietf: 'en-HK', tk: 'hah7vzn.css' },
  hk_zh: { ietf: 'zh-HK', tk: 'jay0ecd' },
  hu: { ietf: 'hu-HU', tk: 'qxw8hzm.css' },
  id_en: { ietf: 'en', tk: 'hah7vzn.css' },
  id_id: { ietf: 'id', tk: 'qxw8hzm.css' },
  ie: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  il_en: { ietf: 'en-IL', tk: 'hah7vzn.css' },
  il_he: { ietf: 'he', tk: 'qxw8hzm.css', dir: 'rtl' },
  in_hi: { ietf: 'hi', tk: 'qxw8hzm.css' },
  in: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  it: { ietf: 'it-IT', tk: 'hah7vzn.css' },
  jp: { ietf: 'ja-JP', tk: 'dvg6awq' },
  kr: { ietf: 'ko-KR', tk: 'qjs5sfm' },
  kw_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl' },
  kw_en: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  la: { ietf: 'es-LA', tk: 'hah7vzn.css' },
  langstore: { ietf: 'en-US', tk: 'hah7vzn.css' },
  lt: { ietf: 'lt-LT', tk: 'qxw8hzm.css' },
  lu_de: { ietf: 'de-LU', tk: 'hah7vzn.css' },
  lu_en: { ietf: 'en-LU', tk: 'hah7vzn.css' },
  lu_fr: { ietf: 'fr-LU', tk: 'hah7vzn.css' },
  lv: { ietf: 'lv-LV', tk: 'qxw8hzm.css' },
  mena_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl' },
  mena_en: { ietf: 'en', tk: 'hah7vzn.css' },
  mt: { ietf: 'en-MT', tk: 'hah7vzn.css' },
  mx: { ietf: 'es-MX', tk: 'hah7vzn.css' },
  my_en: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  my_ms: { ietf: 'ms', tk: 'qxw8hzm.css' },
  ng: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  nl: { ietf: 'nl-NL', tk: 'qxw8hzm.css' },
  no: { ietf: 'no-NO', tk: 'qxw8hzm.css' },
  nz: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  pe: { ietf: 'es-PE', tk: 'hah7vzn.css' },
  ph_en: { ietf: 'en', tk: 'hah7vzn.css' },
  ph_fil: { ietf: 'fil-PH', tk: 'qxw8hzm.css' },
  pl: { ietf: 'pl-PL', tk: 'qxw8hzm.css' },
  pr: { ietf: 'es-419', tk: 'hah7vzn.css' },
  pt: { ietf: 'pt-PT', tk: 'hah7vzn.css' },
  qa_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl' },
  qa_en: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  ro: { ietf: 'ro-RO', tk: 'qxw8hzm.css' },
  ru: { ietf: 'ru-RU', tk: 'qxw8hzm.css' },
  sa_ar: { ietf: 'ar', tk: 'qxw8hzm.css', dir: 'rtl' },
  sa_en: { ietf: 'en', tk: 'hah7vzn.css' },
  se: { ietf: 'sv-SE', tk: 'qxw8hzm.css' },
  sg: { ietf: 'en-SG', tk: 'hah7vzn.css' },
  si: { ietf: 'sl-SI', tk: 'qxw8hzm.css' },
  sk: { ietf: 'sk-SK', tk: 'qxw8hzm.css' },
  th_en: { ietf: 'en', tk: 'hah7vzn.css' },
  th_th: { ietf: 'th', tk: 'qxw8hzm.css' },
  tr: { ietf: 'tr-TR', tk: 'qxw8hzm.css' },
  tw: { ietf: 'zh-TW', tk: 'jay0ecd' },
  ua: { ietf: 'uk-UA', tk: 'qxw8hzm.css' },
  uk: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  vn_en: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  vn_vi: { ietf: 'vi', tk: 'qxw8hzm.css' },
  za: { ietf: 'en-GB', tk: 'hah7vzn.css' },
  cis_en: { ietf: 'en', tk: 'rks2kng.css' },
  cis_ru: { ietf: 'ru', tk: 'qxw8hzm.css' },
  sea: { ietf: 'en', tk: 'hah7vzn.css' },
};

const config$1 = {
  geoRouting: 'on',
  fallbackRouting: 'on',
  links: 'on',
  imsClientId: 'milo',
  codeRoot: '/libs',
  locales,
  prodDomains: 'milo.adobe.com',
  jarvis: {
    id: 'milo',
    version: '1.0',
    onDemand: false,
  },
  privacyId: '7a5eb705-95ed-4cc4-a11d-0cc5760e93db', // valid for *.adobe.com
  breadcrumbs: 'on',
  miloLibs: 'https://main--milo--adobecom.hlx.page/libs',
  // taxonomyRoot: '/your-path-here',
};

//=======================
async function init$8(block) {
  console.log(block);
  debugger
  const nonMiloUrl = "https://main--milo--adobecom.hlx.page/drafts/snehal/fragments/my-gnav";
  try {
    setConfig$1(config$1);
    const { locale, mep } = getConfig$1();
    const url = nonMiloUrl || getMetadata$4('gnav-source') || `${locale.contentRoot}/gnav`;
    const content = await fetchAndProcessPlainHtml({ url })
      .catch((e) => lanaLog({
        message: `Error fetching gnav content url: ${url}`,
        e,
        tags: 'errorType=error,module=gnav',
      }));
    if (!content) return null;
    const gnav = new Gnav({
      content,
      block,
    });
    gnav.init();
    block.setAttribute('daa-im', 'true');
    const mepMartech = mep?.martech || '';
    block.setAttribute('daa-lh', `gnav|${getExperienceName()}${mepMartech}`);
    return gnav;
  } catch (e) {
    lanaLog({ message: 'Could not create global navigation.', e, tags: 'errorType=error,module=gnav' });
    return null;
  }
}

/**
 * Some blocks are not meant to be loaded out of the
 * blocks folder. They are typically used in
 * larger blocks only to help add context to content.
 */
const SYNTHETIC_BLOCKS = [
  'adobe-logo',
  'breadcrumbs',
  'column-break',
  'cross-cloud-menu',
  'gnav-brand',
  'gnav-promo',
  'large-menu',
  'library-metadata',
  'link-group',
  'profile',
  'region-selector',
  'search',
  'social',
];

// eslint-disable-next-line import/prefer-default-export
function showError(block, name) {
  const isSynth = [...block.classList].some((className) => SYNTHETIC_BLOCKS.includes(className));
  if (isSynth) return;
  block.dataset.failed = 'true';
  block.dataset.reason = `Failed loading ${name || ''} block.`;
}

const fallback = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  showError
}, Symbol.toStringTag, { value: 'Module' }));

const PLAY_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32" fill="none" class="play-icon">
                        <path d="M24 16.0005L0 32L1.39876e-06 0L24 16.0005Z" fill="white"/>
                      </svg>`;

function init$7(el, a, btnFormat) {
  const { miloLibs, codeRoot } = getConfig$1();
  const base = miloLibs || codeRoot;
  loadStyle$2(`${base}/styles/consonant-play-button.css`);

  const playBtnFormat = btnFormat.split(':')[1];
  const btnSize = playBtnFormat.includes('-') ? `btn-${playBtnFormat.split('-')[1]}` : 'btn-large';
  const pic = el.querySelector('picture');
  const playIcon = createTag$1('div', { class: 'play-icon-container', 'aria-label': 'play', role: 'button' }, PLAY_ICON_SVG);
  const imgLinkContainer = createTag$1('span', { class: 'modal-img-link' });
  el.insertBefore(imgLinkContainer, pic);
  if (btnSize) a.classList.add(btnSize);
  a.classList.add('consonant-play-btn');
  a.append(playIcon);
  imgLinkContainer.append(pic, a);
}

const imageVideoLink = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: init$7
}, Symbol.toStringTag, { value: 'Module' }));

let fetchedIcons;
let fetched$1 = false;

async function getSVGsfromFile(path) {
  /* c8 ignore next */
  if (!path) return null;
  const { customFetch } = await Promise.resolve().then(() => helpers);
  const resp = await customFetch({ resource: path, withCacheRules: true })
    .catch(() => ({}));
  /* c8 ignore next */
  if (!resp.ok) return null;
  const miloIcons = {};
  const text = await resp.text();
  const parser = new DOMParser();
  const parsedText = parser.parseFromString(text, 'image/svg+xml');
  const symbols = parsedText.querySelectorAll('symbol');
  symbols.forEach((symbol) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    while (symbol.firstChild) svg.appendChild(symbol.firstChild);
    [...symbol.attributes].forEach((attr) => svg.attributes.setNamedItem(attr.cloneNode()));
    svg.classList.add('icon-milo', `icon-milo-${svg.id}`);
    miloIcons[svg.id] = svg;
  });
  return miloIcons;
}

// eslint-disable-next-line no-async-promise-executor
const fetchIcons = (config) => new Promise(async (resolve) => {
  /* c8 ignore next */
  if (!fetched$1) {
    const { miloLibs, codeRoot } = config;
    const base = miloLibs || codeRoot;
    fetchedIcons = await getSVGsfromFile(`${base}/img/icons/icons.svg`);
    fetched$1 = true;
  }
  resolve(fetchedIcons);
});

function decorateToolTip(icon) {
  const wrapper = icon.closest('em');
  wrapper.className = 'tooltip-wrapper';
  if (!wrapper) return;
  const conf = wrapper.textContent.split('|');
  // Text is the last part of a tooltip
  const content = conf.pop().trim();
  if (!content) return;
  icon.dataset.tooltip = content;
  // Position is the next to last part of a tooltip
  const place = conf.pop()?.trim().toLowerCase() || 'right';
  icon.className = `icon icon-info milo-tooltip ${place}`;
  wrapper.parentElement.replaceChild(icon, wrapper);
}

async function loadIcons(icons, config) {
  const iconSVGs = await fetchIcons(config);
  if (!iconSVGs) return;
  icons.forEach(async (icon) => {
    const { classList } = icon;
    if (classList.contains('icon-tooltip')) decorateToolTip(icon);
    const iconName = icon.classList[1].replace('icon-', '');
    const existingIcon = icon.querySelector('svg');
    if (!iconSVGs[iconName] || existingIcon) return;
    const parent = icon.parentElement;
    if (parent.childNodes.length > 1) {
      if (parent.lastChild === icon) {
        icon.classList.add('margin-left');
      } else if (parent.firstChild === icon) {
        icon.classList.add('margin-right');
        if (parent.parentElement.tagName === 'LI') parent.parentElement.classList.add('icon-list-item');
      } else {
        icon.classList.add('margin-left', 'margin-right');
      }
    }
    icon.insertAdjacentHTML('afterbegin', iconSVGs[iconName].outerHTML);
  });
}

const icons = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: loadIcons,
  fetchIcons
}, Symbol.toStringTag, { value: 'Module' }));

async function getPromoFromTaxonomy(contentRoot, doc) {
  const NAME_KEY = 'Name';
  const FOOTER_PROMO_LINK_KEY = 'Footer Promo Link';
  const taxonomyUrl = `${contentRoot}/taxonomy.json`;
  const tags = [...doc.head.querySelectorAll('meta[property="article:tag"]')].map((el) => el.content);

  if (!tags.length) return undefined;

  try {
    const resp = await fetch(taxonomyUrl);
    if (!resp.ok) return undefined;
    const { data } = await resp.json();
    const primaryTag = data.find((tag) => {
      const name = tag[NAME_KEY].split('|').pop().trim();
      return tags.includes(name) && tag[FOOTER_PROMO_LINK_KEY];
    });
    if (primaryTag) return primaryTag[FOOTER_PROMO_LINK_KEY];
  } catch (error) {
    /* c8 ignore next 2 */
    window.lana.log(`Footer Promo - Taxonomy error: ${error}`, { tags: 'errorType=info,module=footer-promo' });
  }
  return undefined;
}

async function initFooterPromo(footerPromoTag, footerPromoType, doc = document) {
  const config = getConfig$1();
  const { locale: { contentRoot } } = config;
  let href = footerPromoTag && `${contentRoot}/fragments/footer-promos/${footerPromoTag}`;

  if (footerPromoType === 'taxonomy') {
    const promo = await getPromoFromTaxonomy(contentRoot, doc);
    if (promo) href = promo;
  }

  if (!href) return;

  const { default: loadFragment } = await Promise.resolve().then(() => fragment);
  const a = createTag$1('a', { href }, href);
  const div = createTag$1('div', null, a);
  const section = createTag$1('div', null, div);
  doc.querySelector('main > div:last-of-type').insertAdjacentElement('afterend', section);
  await loadFragment(a);
  section.classList.add('section');
  const sections = document.querySelectorAll('main > div');
  decorateSectionAnalytics(section, sections.length - 1, config);
}

const footerPromo = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: initFooterPromo
}, Symbol.toStringTag, { value: 'Module' }));

const ALLOY_SEND_EVENT = 'alloy_sendEvent';
const TARGET_TIMEOUT_MS = 4000;
const ENTITLEMENT_TIMEOUT = 3000;

const setDeep = (obj, path, value) => {
  const pathArr = path.split('.');
  let currentObj = obj;

  for (const key of pathArr.slice(0, -1)) {
    if (!currentObj[key] || typeof currentObj[key] !== 'object') {
      currentObj[key] = {};
    }
    currentObj = currentObj[key];
  }

  currentObj[pathArr[pathArr.length - 1]] = value;
};

// eslint-disable-next-line max-len
const waitForEventOrTimeout = (eventName, timeout, returnValIfTimeout) => new Promise((resolve) => {
  const listener = (event) => {
    // eslint-disable-next-line no-use-before-define
    clearTimeout(timer);
    resolve(event.detail);
  };

  const timer = setTimeout(() => {
    window.removeEventListener(eventName, listener);
    if (returnValIfTimeout !== undefined) {
      resolve(returnValIfTimeout);
    } else {
      resolve({ timeout: true });
    }
  }, timeout);

  window.addEventListener(eventName, listener, { once: true });
});

const getExpFromParam = (expParam) => {
  const lastSlash = expParam.lastIndexOf('/');
  return {
    experiments: [{
      experimentPath: expParam.substring(0, lastSlash),
      variantLabel: expParam.substring(lastSlash + 1),
    }],
  };
};

const handleAlloyResponse = (response) => {
  const items = (
    (response.propositions?.length && response.propositions)
    || (response.decisions?.length && response.decisions)
    || []
  ).map((i) => i.items).flat();

  if (!items?.length) return [];

  return items
    .map((item) => {
      const content = item?.data?.content;
      if (!content || !(content.manifestLocation || content.manifestContent)) return null;

      return {
        manifestPath: content.manifestLocation || content.manifestPath,
        manifestUrl: content.manifestLocation,
        manifestData: content.manifestContent?.experiences?.data || content.manifestContent?.data,
        manifestPlaceholders: content.manifestContent?.placeholders?.data,
        manifestInfo: content.manifestContent?.info.data,
        name: item.meta['activity.name'],
        variantLabel: item.meta['experience.name'] && `target-${item.meta['experience.name']}`,
        meta: item.meta,
      };
    })
    .filter(Boolean);
};

function roundToQuarter(num) {
  return Math.ceil(num / 250) / 4;
}

function calculateResponseTime(responseStart) {
  const responseTime = Date.now() - responseStart;
  return roundToQuarter(responseTime);
}

function sendTargetResponseAnalytics(failure, responseStart, timeout, message) {
  // temporary solution until we can decide on a better timeout value
  const responseTime = calculateResponseTime(responseStart);
  const timeoutTime = roundToQuarter(timeout);
  let val = `target response time ${responseTime}:timed out ${failure}:timeout ${timeoutTime}`;
  window.alloy('sendEvent', {
    documentUnloading: true,
    xdm: {
      eventType: 'web.webinteraction.linkClicks',
      web: {
        webInteraction: {
          linkClicks: { value: 1 },
          type: 'other',
          name: val,
        },
      },
    },
    data: { _adobe_corpnew: { digitalData: { primaryEvent: { eventInfo: { eventName: val } } } } },
  });
}

const getTargetPersonalization = async () => {
  const params = new URL(window.location.href).searchParams;

  const experimentParam = params.get('experiment');
  if (experimentParam) return getExpFromParam(experimentParam);

  const timeout = parseInt(params.get('target-timeout'), 10)
    || parseInt(getMetadata$4('target-timeout'), 10)
    || TARGET_TIMEOUT_MS;

  const responseStart = Date.now();
  window.addEventListener(ALLOY_SEND_EVENT, () => {
    const responseTime = calculateResponseTime(responseStart);
    window.lana.log(`target response time: ${responseTime}`, { tags: 'errorType=info,module=martech' });
  }, { once: true });

  let manifests = [];
  const response = await waitForEventOrTimeout(ALLOY_SEND_EVENT, timeout);
  if (response.timeout) {
    waitForEventOrTimeout(ALLOY_SEND_EVENT, 5100 - timeout)
      .then(() => sendTargetResponseAnalytics(true, responseStart, timeout));
  } else {
    sendTargetResponseAnalytics(false, responseStart, timeout);
    manifests = handleAlloyResponse(response.result);
  }

  return manifests;
};

const getDtmLib = (env) => ({
  edgeConfigId: env.consumer?.edgeConfigId || env.edgeConfigId,
  url:
    env.name === 'prod'
      ? env.consumer?.marTechUrl || 'https://assets.adobedtm.com/d4d114c60e50/a0e989131fd5/launch-5dd5dd2177e6.min.js'
      : env.consumer?.marTechUrl || 'https://assets.adobedtm.com/d4d114c60e50/a0e989131fd5/launch-a27b33fc2dc0-development.min.js',
});

const setupEntitlementCallback = () => {
  const setEntitlements = async (destinations) => {
    const { default: parseEntitlements } = await Promise.resolve().then(() => entitlements);
    return parseEntitlements(destinations);
  };

  const getEntitlements = (resolve) => {
    const handleEntitlements = (detail) => {
      if (detail?.result?.destinations?.length) {
        resolve(setEntitlements(detail.result.destinations));
      } else {
        resolve([]);
      }
    };
    waitForEventOrTimeout(ALLOY_SEND_EVENT, ENTITLEMENT_TIMEOUT, [])
      .then(handleEntitlements)
      .catch(() => resolve([]));
  };

  const { miloLibs, codeRoot, entitlements: resolveEnt } = getConfig$1();
  getEntitlements(resolveEnt);

  loadLink(
    `${miloLibs || codeRoot}/features/personalization/entitlements.js`,
    { as: 'script', rel: 'modulepreload' },
  );
};

let filesLoadedPromise = false;
const loadMartechFiles = async (config, url, edgeConfigId) => {
  if (filesLoadedPromise) return filesLoadedPromise;

  filesLoadedPromise = async () => {
    loadIms()
      .then(() => {
        if (window.adobeIMS.isSignedInUser()) setupEntitlementCallback();
      })
      .catch(() => {});

    setDeep(
      window,
      'alloy_all.data._adobe_corpnew.digitalData.page.pageInfo.language',
      config.locale.ietf,
    );
    setDeep(window, 'digitalData.diagnostic.franklin.implementation', 'milo');

    window.marketingtech = {
      adobe: {
        launch: { url, controlPageLoad: true },
        alloy: { edgeConfigId },
        target: false,
      },
      milo: true,
    };
    window.edgeConfigId = edgeConfigId;

    const env = ['stage', 'local'].includes(config.env.name) ? '.qa' : '';
    const martechPath = `martech.main.standard${env}.min.js`;
    await loadScript$1(`${config.miloLibs || config.codeRoot}/deps/${martechPath}`);
    // eslint-disable-next-line no-underscore-dangle
    window._satellite.track('pageload');
  };

  await filesLoadedPromise();
  return filesLoadedPromise;
};

async function init$6({
  persEnabled = false,
  persManifests = [],
  postLCP = false,
}) {
  const config = getConfig$1();

  const { url, edgeConfigId } = getDtmLib(config.env);
  loadLink(url, { as: 'script', rel: 'preload' });

  const martechPromise = loadMartechFiles(config, url, edgeConfigId);

  if (persEnabled) {
    loadLink(
      `${config.miloLibs || config.codeRoot}/features/personalization/personalization.js`,
      { as: 'script', rel: 'modulepreload' },
    );

    const targetManifests = await getTargetPersonalization();
    if (targetManifests?.length || persManifests?.length) {
      const { preloadManifests, applyPers } = await Promise.resolve().then(() => personalization);
      const manifests = preloadManifests({ targetManifests, persManifests });
      await applyPers(manifests, postLCP);
    }
  }

  return martechPromise;
}

const martech = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: init$6
}, Symbol.toStringTag, { value: 'Module' }));

const GMTStringToLocalDate = (gmtString) => new Date(`${gmtString}+00:00`);

const isDisabled = (event, searchParams) => {
  if (!event) return false;
  const currentDate = searchParams?.get('instant') ? new Date(searchParams.get('instant')) : new Date();
  if ((!event.start && event.end) || (!event.end && event.start)) return true;
  return Boolean(event.start && event.end
    && (currentDate < event.start || currentDate > event.end));
};

function getPromoManifests(manifestNames, searchParams) {
  const attachedManifests = manifestNames
    ? manifestNames.split(',')?.map((manifest) => manifest?.trim())
    : [];
  const schedule = getMetadata$4('schedule');
  if (!schedule) {
    return [];
  }
  return schedule.split(',')
    .map((manifest) => {
      const [name, start, end, manifestPath] = manifest.trim().split('|').map((s) => s.trim());
      if (attachedManifests.includes(name)) {
        const event = {
          name,
          start: GMTStringToLocalDate(start),
          end: GMTStringToLocalDate(end),
        };
        const disabled = isDisabled(event, searchParams);
        return { manifestPath, disabled, event };
      }
      return null;
    })
    .filter((manifest) => manifest != null);
}

const promoUtils = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: getPromoManifests,
  isDisabled
}, Symbol.toStringTag, { value: 'Module' }));

const ENTITLEMENT_MAP = {
  '51b1f617-2e43-4e91-a98a-3b7716ecba8f': 'photoshop-any',
  '8ba78b22-90fb-4b97-a1c4-f8c03a45cbc2': 'indesign-any',
  '8d3c8ac2-2937-486b-b6ff-37f02271b09b': 'illustrator-any',
  'fd30e9c7-9ae9-44db-8e70-5c652a5bb1d2': 'cc-all-apps-any',
  '4e2f2a6e-48c4-49eb-9dd5-c44070abb3f0': 'after-effects-any',
  'e7650448-268b-4a0d-9795-05f604d7e42f': 'lightroom-any',
  '619130fc-c7b5-4b39-a687-b32061326869': 'premiere-pro-any',
  'cec4d899-4b41-469e-9f2d-4658689abf29': 'phsp-ltr-bundle',
  '8da44606-9841-43d0-af72-86d5a9d3bba0': 'cc-photo',
  'ab713720-91a2-4e8e-b6d7-6f613e049566': 'any-cc-product-no-stock',
  'b0f65e1c-7737-4788-b3ae-0011c80bcbe1': 'any-cc-product-with-stock',
  '934fdc1d-7ba6-4644-908b-53e01e550086': 'any-dc-product',
  '6dfcb769-324f-42e0-9e12-1fc4dc0ee85b': 'always-on-promo',
  '015c52cb-30b0-4ac9-b02e-f8716b39bfb6': 'not-q-always-on-promo',
  '42e06851-64cd-4684-a54a-13777403487a': '3d-substance-collection',
  'eda8c774-420b-44c2-9006-f9a8d0fb5168': '3d-substance-texturing',
  '76e408f6-ab08-49f0-adb6-f9b4efcc205d': 'free-cc',
  '08216aa4-4a0f-4136-8b27-182212764a7c': 'free-dc',
  // PEP segments
  '6cb0d58c-3a65-47e2-b459-c52bb158d5b6': 'lightroom-web-usage',
  'caa3de84-6336-4fa8-8db2-240fc88106cc': 'photoshop-signup-source',
  'ef82408e-1bab-4518-b655-a88981515d6b': 'photoshop-web-usage',
  '5c6a4bb8-a2f3-4202-8cca-f5e918b969dc': 'firefly-signup-source',
  '20106303-e88c-4b15-93e5-f6a1c3215a12': 'firefly-web-usage',
  '3df0b0b0-d06e-4fcc-986e-cc97f54d04d8': 'acrobat-web-usage',
};

const getEntitlementMap = async () => {
  const { env, consumerEntitlements } = getConfig$1();
  if (env?.name === 'prod') return { ...consumerEntitlements, ...ENTITLEMENT_MAP };
  const { default: STAGE_ENTITLEMENTS } = await Promise.resolve().then(() => stageEntitlements);
  return { ...consumerEntitlements, ...STAGE_ENTITLEMENTS };
};

const getEntitlements = async (data) => {
  const entitlementMap = await getEntitlementMap();

  return data.flatMap((destination) => {
    const ents = destination.segments?.flatMap((segment) => {
      const entMatch = entitlementMap[segment.id];
      return entMatch ? [entMatch] : [];
    });

    return ents || [];
  });
};

function init$5(data) {
  return getEntitlements(data);
}

const entitlements = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: init$5,
  getEntitlementMap
}, Symbol.toStringTag, { value: 'Module' }));

/* eslint-disable no-console */


/* c8 ignore start */
const PHONE_SIZE = window.screen.width < 768 || window.screen.height < 768;
const PERSONALIZATION_TAGS = {
  all: () => true,
  chrome: () => navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edg'),
  firefox: () => navigator.userAgent.includes('Firefox'),
  safari: () => navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'),
  edge: () => navigator.userAgent.includes('Edg'),
  android: () => navigator.userAgent.includes('Android'),
  ios: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
  windows: () => navigator.userAgent.includes('Windows'),
  mac: () => navigator.userAgent.includes('Macintosh'),
  'mobile-device': () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Touch/i.test(navigator.userAgent),
  phone: () => PERSONALIZATION_TAGS['mobile-device']() && PHONE_SIZE,
  tablet: () => PERSONALIZATION_TAGS['mobile-device']() && !PHONE_SIZE,
  desktop: () => !PERSONALIZATION_TAGS['mobile-device'](),
  loggedout: () => !window.adobeIMS?.isSignedInUser(),
  loggedin: () => !!window.adobeIMS?.isSignedInUser(),
};
const PERSONALIZATION_KEYS = Object.keys(PERSONALIZATION_TAGS);
/* c8 ignore stop */

const CLASS_EL_DELETE = 'p13n-deleted';
const CLASS_EL_REPLACE = 'p13n-replaced';
const COLUMN_NOT_OPERATOR = 'not';
const TARGET_EXP_PREFIX = 'target-';
const INLINE_HASH = '_inline';
const PAGE_URL = new URL(window.location.href);

const TRACKED_MANIFEST_TYPE = 'personalization';

// Replace any non-alpha chars except comma, space, ampersand and hyphen
const RE_KEY_REPLACE = /[^a-z0-9\- _,&=]/g;

const MANIFEST_KEYS = [
  'action',
  'selector',
  'pagefilter',
  'page filter',
  'page filter optional',
];

const DATA_TYPE = {
  JSON: 'json',
  TEXT: 'text',
};

const IN_BLOCK_SELECTOR_PREFIX = 'in-block:';

const appendJsonExt = (path) => (path.endsWith('.json') ? path : `${path}.json`);

const normalizePath = (p, localize = true) => {
  let path = p;

  if (!path?.includes('/')) {
    return path;
  }

  const config = getConfig$1();

  if (path.startsWith(config.codeRoot)
    || path.includes('.hlx.')
    || path.includes('.adobe.')) {
    try {
      const url = new URL(path);
      const firstFolder = url.pathname.split('/')[1];
      if (!localize
        || config.locale.ietf === 'en-US'
        || url.hash.includes('#_dnt')
        || firstFolder in config.locales
        || path.includes('.json')) {
        path = url.pathname;
      } else {
        path = `${config.locale.prefix}${url.pathname}`;
      }
    } catch (e) { /* return path below */ }
  } else if (!path.startsWith('http') && !path.startsWith('/')) {
    path = `/${path}`;
  }
  return path;
};

const preloadManifests = ({ targetManifests = [], persManifests = [] }) => {
  let manifests = targetManifests;

  manifests = manifests.concat(
    persManifests.map((manifest) => ({
      ...manifest,
      manifestPath: normalizePath(appendJsonExt(manifest.manifestPath)),
      manifestUrl: manifest.manifestPath,
    })),
  );

  for (const manifest of manifests) {
    if (!manifest.manifestData && manifest.manifestPath && !manifest.disabled) {
      loadLink(
        manifest.manifestPath,
        { as: 'fetch', crossorigin: 'anonymous', rel: 'preload' },
      );
    }
  }
  return manifests;
};

const getFileName = (path) => path?.split('/').pop();

const createFrag = (el, url, manifestId) => {
  let href = url;
  try {
    const { pathname, search, hash } = new URL(url);
    href = `${pathname}${search}${hash}`;
  } catch {
    // ignore
  }
  const a = createTag$1('a', { href }, url);
  if (manifestId) a.dataset.manifestId = manifestId;
  let frag = createTag$1('p', undefined, a);
  const isSection = el.parentElement.nodeName === 'MAIN';
  if (isSection) {
    frag = createTag$1('div', undefined, frag);
  }
  loadLink(`${localizeLink(a.href)}.plain.html`, { as: 'fetch', crossorigin: 'anonymous', rel: 'preload' });
  return frag;
};

const GLOBAL_CMDS = [
  'insertscript',
  'replacepage',
  'updatemetadata',
  'useblockcode',
];

const CREATE_CMDS = {
  insertafter: 'afterend',
  insertbefore: 'beforebegin',
  prependtosection: 'afterbegin',
  appendtosection: 'beforeend',
};

const COMMANDS = {
  remove: (el, target, manifestId) => {
    if (target === 'false') return;
    if (manifestId) {
      el.dataset.removedManifestId = manifestId;
      return;
    }
    el.classList.add(CLASS_EL_DELETE);
  },
  replace: (el, target, manifestId) => {
    if (!el || el.classList.contains(CLASS_EL_REPLACE)) return;
    el.insertAdjacentElement('beforebegin', createFrag(el, target, manifestId));
    el.classList.add(CLASS_EL_DELETE, CLASS_EL_REPLACE);
  },
};

function checkSelectorType(selector) {
  return selector?.startsWith('/') || selector?.startsWith('http') ? 'fragment' : 'css';
}

const fetchData = async (url, type = DATA_TYPE.JSON) => {
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      /* c8 ignore next 5 */
      if (resp.status === 404) {
        throw new Error('File not found');
      }
      throw new Error(`Invalid response: ${resp.status} ${resp.statusText}`);
    }
    return await resp[type]();
  } catch (e) {
    /* c8 ignore next 3 */
    console.log(`Error loading content: ${url}`, e.message || e);
  }
  return null;
};

const getBlockProps = (fVal) => {
  let val = fVal;
  if (val?.includes('\\')) val = val?.split('\\').join('/');
  if (!val?.startsWith('/')) val = `/${val}`;
  const blockSelector = val?.split('/').pop();
  const { origin } = PAGE_URL;
  if (origin.includes('.hlx.') || origin.includes('localhost')) {
    if (val.startsWith('/libs/')) {
      /* c8 ignore next 2 */
      const { miloLibs, codeRoot } = getConfig$1();
      val = `${miloLibs || codeRoot}${val.replace('/libs', '')}`;
    } else {
      val = `${origin}${val}`;
    }
  }
  return { blockSelector, blockTarget: val };
};

const consolidateArray = (arr, prop, existing = []) => arr
  .reduce((results, i) => [...results, ...i[prop] || []], existing);

const consolidateObjects = (arr, prop, existing = {}) => arr.reduce((propMap, item) => {
  item[prop]?.forEach((i) => {
    const { selector, val } = i;
    if (prop === 'blocks') {
      propMap[selector] = val;
      return;
    }

    if (selector in propMap) return;
    const action = {
      action: i.action,
      fragment: val,
      selector,
      manifestPath: item.manifestPath,
      manifestId: i.manifestId,
    };
    // eslint-disable-next-line no-restricted-syntax
    for (const key in propMap) {
      if (propMap[key].fragment === selector) propMap[key] = action;
    }
    propMap[selector] = action;
  });
  return { ...existing, ...propMap };
}, {});

const matchGlob = (searchStr, inputStr) => {
  const pattern = searchStr.replace(/\*\*/g, '.*');
  const reg = new RegExp(`^${pattern}(\\.html)?$`, 'i'); // devtool bug needs this backtick: `
  return reg.test(inputStr);
};

async function replaceInner(path, element) {
  if (!path || !element) return false;
  let plainPath = path.endsWith('/') ? `${path}index` : path;
  plainPath = plainPath.endsWith('.plain.html') ? plainPath : `${plainPath}.plain.html`;
  const html = await fetchData(plainPath, DATA_TYPE.TEXT);
  if (!html) return false;

  element.innerHTML = html;
  const { decorateArea } = getConfig$1();
  if (decorateArea) decorateArea(element);
  return true;
}
/* c8 ignore stop */

const setMetadata = (metadata) => {
  const { selector, val } = metadata;
  if (!selector || !val) return;
  const propName = selector.startsWith('og:') ? 'property' : 'name';
  let metaEl = document.querySelector(`meta[${propName}="${selector}"]`);
  if (!metaEl) {
    metaEl = document.createElement('meta');
    metaEl.setAttribute(propName, selector);
    document.head.append(metaEl);
  }
  metaEl.setAttribute('content', val);
};

function toLowerAlpha(str) {
  const s = str.toLowerCase();
  return s.replace(RE_KEY_REPLACE, '');
}

function normalizeKeys(obj) {
  return Object.keys(obj).reduce((newObj, key) => {
    newObj[toLowerAlpha(key)] = obj[key];
    return newObj;
  }, {});
}

const getDivInTargetedCell = (tableCell) => {
  tableCell.replaceChildren();
  const div = document.createElement('div');
  tableCell.appendChild(div);
  return div;
};

const querySelector = (el, selector, all = false) => {
  try {
    return all ? el.querySelectorAll(selector) : el.querySelector(selector);
  } catch (e) {
    /* eslint-disable-next-line no-console */
    console.log('Invalid selector: ', selector);
    return null;
  }
};

function getTrailingNumber(s) {
  const match = s.match(/\d+$/);
  return match ? parseInt(match[0], 10) : null;
}

function getSection(rootEl, idx) {
  return rootEl === document
    ? document.querySelector(`body > main > div:nth-child(${idx})`)
    : rootEl.querySelector(`:scope > div:nth-child(${idx})`);
}

function registerInBlockActions(cmd, manifestId) {
  const { action, target, selector } = cmd;
  const command = { action, target, manifestId };

  const blockAndSelector = selector.substring(IN_BLOCK_SELECTOR_PREFIX.length).trim().split(/\s+/);
  const [blockName] = blockAndSelector;

  const config = getConfig$1();
  config.mep.inBlock ??= {};
  config.mep.inBlock[blockName] ??= {};

  let blockSelector;
  if (blockAndSelector.length > 1) {
    blockSelector = blockAndSelector.slice(1).join(' ');
    command.selector = blockSelector;
    if (checkSelectorType(blockSelector) === 'fragment') {
      config.mep.inBlock[blockName].fragments ??= {};
      const { fragments } = config.mep.inBlock[blockName];
      delete command.selector;
      if (blockSelector in fragments) return;

      // eslint-disable-next-line no-restricted-syntax
      for (const key in fragments) {
        if (fragments[key].target === blockSelector) fragments[key] = command;
      }
      fragments[blockSelector] = command;

      blockSelector = normalizePath(blockSelector);
      // eslint-disable-next-line no-restricted-syntax
      for (const key in fragments) {
        if (fragments[key].target === blockSelector) fragments[key] = command;
      }
      fragments[blockSelector] = command;
      return;
    }
  }
  config.mep.inBlock[blockName].commands ??= [];
  config.mep.inBlock[blockName].commands.push(command);
}

function getSelectedElement(selector, action, rootEl) {
  if (!selector) return null;
  if ((action.includes('appendtosection') || action.includes('prependtosection'))) {
    if (!selector.includes('section')) return null;
    const section = selector.trim().replace('section', '');
    if (section !== '' && Number.isNaN(section)) return null;
  }
  if (checkSelectorType(selector) === 'fragment') {
    try {
      const fragment = document.querySelector(`a[href*="${normalizePath(selector, false)}"], a[href*="${normalizePath(selector, true)}"]`);
      if (fragment) return fragment.parentNode;
      return null;
    } catch (e) {
      return null;
    }
  }

  let selectedEl;
  if (selector.includes('.') || !['section', 'block', 'row'].some((s) => selector.includes(s))) {
    selectedEl = querySelector(rootEl, selector);
    if (selectedEl) return selectedEl;
  }

  const terms = selector.split(/\s+/);

  let section = null;
  if (terms[0]?.startsWith('section')) {
    const sectionIdx = getTrailingNumber(terms[0]) || 1;
    section = getSection(rootEl, sectionIdx);
    terms.shift();
  }

  if (terms.length) {
    const blockStr = terms.shift();
    if (blockStr.includes('.')) {
      selectedEl = querySelector(section || rootEl, blockStr);
    } else {
      const blockIndex = getTrailingNumber(blockStr) || 1;
      const blockName = blockStr.replace(`${blockIndex}`, '');
      if (blockName === 'block') {
        if (!section) section = getSection(rootEl, 1);
        selectedEl = querySelector(section, `:scope > div:nth-of-type(${blockIndex})`);
      } else {
        selectedEl = querySelector(section || rootEl, `.${blockName}`, true)?.[blockIndex - 1];
      }
    }
  } else if (section) {
    return section;
  }

  if (terms.length) {
    // find targeted table cell in rowX colY format
    const rowColMatch = /row(?<row>\d+)\s+col(?<col>\d+)/gm.exec(terms.join(' '));
    if (rowColMatch) {
      const { row, col } = rowColMatch.groups;
      const tableCell = querySelector(selectedEl, `:nth-child(${row}) > :nth-child(${col})`);
      if (!tableCell) return null;
      return getDivInTargetedCell(tableCell);
    }
  }

  return selectedEl;
}

const addHash = (url, newHash) => {
  try {
    const { origin, pathname, search } = new URL(url);
    return `${origin}${pathname}${search}#${newHash}`;
  } catch (e) {
    return `${url}#${newHash}`;
  }
};

function handleCommands(commands, rootEl = document, forceInline = false) {
  commands.forEach((cmd) => {
    const { manifestId } = cmd;
    const { action, selector, target: trgt } = cmd;
    const target = forceInline ? addHash(trgt, INLINE_HASH) : trgt;
    if (selector.startsWith(IN_BLOCK_SELECTOR_PREFIX)) {
      registerInBlockActions(cmd, manifestId);
      return;
    }

    if (action in COMMANDS) {
      const el = getSelectedElement(selector, action, rootEl);
      COMMANDS[action](el, target, manifestId);
    } else if (action in CREATE_CMDS) {
      const el = getSelectedElement(selector, action, rootEl);
      el?.insertAdjacentElement(
        CREATE_CMDS[action],
        createFrag(el, target, manifestId),
      );
    } else {
      /* c8 ignore next 2 */
      console.log('Invalid command found: ', cmd);
    }
  });
}

const getVariantInfo = (line, variantNames, variants, manifestId) => {
  const action = line.action?.toLowerCase().replace('content', '').replace('fragment', '');
  const { selector } = line;
  const pageFilter = line['page filter'] || line['page filter optional'];

  if (pageFilter && !matchGlob(pageFilter, new URL(window.location).pathname)) return;

  variantNames.forEach((vn) => {
    if (!line[vn] || line[vn].toLowerCase() === 'false') return;

    const variantInfo = {
      action,
      selector,
      pageFilter,
      target: line[vn],
      selectorType: checkSelectorType(selector),
      manifestId,
    };

    if (action in COMMANDS && variantInfo.selectorType === 'fragment') {
      variants[vn].fragments.push({
        selector: normalizePath(variantInfo.selector),
        val: normalizePath(line[vn]),
        action,
        manifestId,
      });
    } else if (GLOBAL_CMDS.includes(action)) {
      variants[vn][action] = variants[vn][action] || [];

      if (action === 'useblockcode') {
        const { blockSelector, blockTarget } = getBlockProps(line[vn]);
        variants[vn][action].push({
          selector: blockSelector,
          val: blockTarget,
          pageFilter,
          manifestId,
        });
      } else {
        variants[vn][action].push({
          selector: normalizePath(selector),
          val: normalizePath(line[vn]),
          pageFilter,
          manifestId,
        });
      }
    } else if (action in COMMANDS || action in CREATE_CMDS) {
      variants[vn].commands.push(variantInfo);
    } else {
      /* c8 ignore next 2 */
      console.log('Invalid action found: ', line);
    }
  });
};

function parseConfig(data, manifestId) {
  if (!data?.length) return null;

  const config = {};
  const experiences = data.map((d) => normalizeKeys(d));

  try {
    const variants = {};
    const variantNames = Object.keys(experiences[0])
      .filter((vn) => !MANIFEST_KEYS.includes(vn));

    variantNames.forEach((vn) => {
      variants[vn] = { commands: [], fragments: [] };
    });

    experiences.forEach((line) => getVariantInfo(line, variantNames, variants, manifestId));

    config.variants = variants;
    config.variantNames = variantNames;
    return config;
  } catch (e) {
    /* c8 ignore next 3 */
    console.log('error parsing personalization config:', e, experiences);
  }
  return null;
}

/* c8 ignore start */
function parsePlaceholders(placeholders, config, selectedVariantName = '') {
  if (!placeholders?.length || selectedVariantName === 'default') return config;
  const valueNames = [
    'value',
    selectedVariantName.toLowerCase(),
    config.locale.ietf.toLowerCase(),
    ...config.locale.ietf.toLowerCase().split('-'),
  ];
  const [val] = Object.entries(placeholders[0])
    .find(([key]) => valueNames.includes(key.toLowerCase()));
  if (val) {
    const results = placeholders.reduce((res, item) => {
      res[item.key] = item[val];
      return res;
    }, {});
    config.placeholders = { ...(config.placeholders || {}), ...results };
  }
  return config;
}

const checkForParamMatch = (paramStr) => {
  const [name, val] = paramStr.split('param-')[1].split('=');
  if (!name) return false;
  const params = new URLSearchParams(
    Array.from(PAGE_URL.searchParams, ([key, value]) => [key.toLowerCase(), value?.toLowerCase()]),
  );
  const searchParamVal = params.get(name.toLowerCase());
  if (searchParamVal !== null) {
    if (val) return val === searchParamVal;
    return true; // if no val is set, just check for existence of param
  }
  return false;
};

async function getPersonalizationVariant(manifestPath, variantNames = [], variantLabel = null) {
  const variantInfo = variantNames.reduce((acc, name) => {
    let nameArr = [name];
    if (!name.startsWith(TARGET_EXP_PREFIX)) nameArr = name.split(',');
    const vNames = nameArr.map((v) => v.trim()).filter(Boolean);
    acc[name] = vNames;
    acc.allNames = [...acc.allNames, ...vNames];
    return acc;
  }, { allNames: [] });

  const entitlementKeys = Object.values(await getEntitlementMap());
  const hasEntitlementTag = entitlementKeys.some((tag) => variantInfo.allNames.includes(tag));

  let userEntitlements = [];
  if (hasEntitlementTag) {
    const config = getConfig$1();
    userEntitlements = await config.entitlements();
  }

  const hasMatch = (name) => {
    if (name === '') return true;
    if (name === variantLabel?.toLowerCase()) return true;
    if (name.startsWith('param-')) return checkForParamMatch(name);
    if (userEntitlements?.includes(name)) return true;
    return PERSONALIZATION_KEYS.includes(name) && PERSONALIZATION_TAGS[name]();
  };

  const matchVariant = (name) => {
    if (name.startsWith(TARGET_EXP_PREFIX)) return hasMatch(name);
    const processedList = name.split('&').map((condition) => {
      const reverse = condition.trim().startsWith(COLUMN_NOT_OPERATOR);
      const match = hasMatch(condition.replace(COLUMN_NOT_OPERATOR, '').trim());
      return reverse ? !match : match;
    });
    return !processedList.includes(false);
  };

  const matchingVariant = variantNames.find((variant) => variantInfo[variant].some(matchVariant));
  return matchingVariant;
}

const createDefaultExperiment = (manifest) => ({
  disabled: manifest.disabled,
  event: manifest.event,
  manifest: manifest.manifestPath,
  selectedVariant: { commands: [], fragments: [] },
  selectedVariantName: 'default',
  variantNames: ['all'],
  variants: {},
});

async function getPersConfig(info, override = false) {
  const {
    name,
    manifestData,
    manifestPath,
    manifestUrl,
    manifestPlaceholders,
    manifestInfo,
    variantLabel,
    disabled,
    event,
  } = info;
  if (disabled && !override) {
    return createDefaultExperiment(info);
  }
  let data = manifestData;
  if (!data) {
    const fetchedData = await fetchData(manifestPath, DATA_TYPE.JSON);
    if (fetchData) data = fetchedData;
  }

  const persData = data?.experiences?.data || data?.data || data;
  if (!persData) return null;

  let manifestId = getFileName(manifestPath);
  const globalConfig = getConfig$1();
  if (!globalConfig.mep?.preview) {
    manifestId = false;
  } else if (name) {
    manifestId = `${name}: ${manifestId}`;
  }
  const config = parseConfig(persData, manifestId);

  if (!config) {
    /* c8 ignore next 3 */
    console.log('Error loading personalization config: ', name || manifestPath);
    return null;
  }

  const infoTab = manifestInfo || data?.info?.data;
  const infoKeyMap = {
    'manifest-type': ['Personalization', 'Promo', 'Test'],
    'manifest-execution-order': ['First', 'Normal', 'Last'],
  };
  if (infoTab) {
    const infoObj = infoTab?.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    config.manifestOverrideName = infoObj?.['manifest-override-name']?.toLowerCase();
    config.manifestType = infoObj?.['manifest-type']?.toLowerCase();
    const executionOrder = {
      'manifest-type': 1,
      'manifest-execution-order': 1,
    };
    Object.keys(infoObj).forEach((key) => {
      if (!infoKeyMap[key]) return;
      const index = infoKeyMap[key].indexOf(infoObj[key]);
      executionOrder[key] = index > -1 ? index : 1;
    });
    config.executionOrder = `${executionOrder['manifest-execution-order']}-${executionOrder['manifest-type']}`;
  } else {
    // eslint-disable-next-line prefer-destructuring
    config.manifestType = infoKeyMap['manifest-type'][1];
    config.executionOrder = '1-1';
  }

  config.manifestPath = normalizePath(manifestPath);
  const selectedVariantName = await getPersonalizationVariant(
    config.manifestPath,
    config.variantNames,
    variantLabel,
  );

  if (selectedVariantName && config.variantNames.includes(selectedVariantName)) {
    config.run = true;
    config.selectedVariantName = selectedVariantName;
    config.selectedVariant = config.variants[selectedVariantName];
  } else {
    /* c8 ignore next 2 */
    config.selectedVariantName = 'default';
    config.selectedVariant = 'default';
  }

  const placeholders = manifestPlaceholders || data?.placeholders?.data;
  if (placeholders) {
    updateConfig(
      parsePlaceholders(placeholders, getConfig$1(), config.selectedVariantName),
    );
  }

  config.name = name;
  config.manifest = manifestPath;
  config.manifestUrl = manifestUrl;
  config.disabled = disabled;
  config.event = event;
  return config;
}

const deleteMarkedEls = (rootEl = document) => {
  [...rootEl.querySelectorAll(`.${CLASS_EL_DELETE}`)]
    .forEach((el) => el.remove());
};

const normalizeFragPaths = ({ selector, val, action }) => ({
  selector: normalizePath(selector),
  val: normalizePath(val),
  action,
});

async function categorizeActions(experiment) {
  if (!experiment) return null;
  const { manifestPath, selectedVariant } = experiment;
  if (!selectedVariant || selectedVariant === 'default') return { experiment };

  if (selectedVariant.replacepage) {
    // only one replacepage can be defined
    await replaceInner(selectedVariant.replacepage[0]?.val, document.querySelector('main'));
    document.querySelector('main').dataset.manifestId = manifestPath;
  }

  selectedVariant.insertscript?.map((script) => loadScript$1(script.val));
  selectedVariant.updatemetadata?.map((metadata) => setMetadata(metadata));

  selectedVariant.fragments &&= selectedVariant.fragments.map(normalizeFragPaths);

  return {
    manifestPath,
    experiment,
    blocks: selectedVariant.useblockcode,
    fragments: selectedVariant.fragments,
    commands: selectedVariant.commands,
  };
}

function overridePersonalizationVariant(manifest, config) {
  const { manifestPath, variantNames } = manifest;
  if (!config.mep?.override) return;
  let selectedVariant;
  config.mep?.override?.split('---').some((item) => {
    const pair = item.trim().split('--');
    if (pair[0] === manifestPath && pair.length > 1) {
      [, selectedVariant] = pair;
      return true;
    }
    return false;
  });
  if (!selectedVariant) return;
  if (variantNames.includes(selectedVariant)) {
    manifest.selectedVariantName = selectedVariant;
    manifest.selectedVariant = manifest.variants[selectedVariant];
    return;
  }
  manifest.selectedVariantName = selectedVariant;
  manifest.selectedVariant = manifest.variants[selectedVariant];
}

function compareExecutionOrder(a, b) {
  if (a.executionOrder === b.executionOrder) return 0;
  return a.executionOrder > b.executionOrder ? 1 : -1;
}

function cleanAndSortManifestList(manifests) {
  const config = getConfig$1();
  const manifestObj = {};
  let allManifests = manifests;
  if (config.mep?.experiments) allManifests = [...manifests, ...config.mep.experiments];
  allManifests.forEach((manifest) => {
    try {
      if (!manifest?.manifest) return;
      if (!manifest.manifestPath) manifest.manifestPath = normalizePath(manifest.manifest);
      if (manifest.manifestPath in manifestObj) {
        let fullManifest = manifestObj[manifest.manifestPath];
        let freshManifest = manifest;
        if (manifest.name) {
          fullManifest = manifest;
          freshManifest = manifestObj[manifest.manifestPath];
        }
        freshManifest.name = fullManifest.name;
        freshManifest.selectedVariantName = fullManifest.selectedVariantName;
        freshManifest.selectedVariant = freshManifest.variants[freshManifest.selectedVariantName];
        manifestObj[manifest.manifestPath] = freshManifest;
      } else {
        manifestObj[manifest.manifestPath] = manifest;
      }
      if (config.mep?.override) overridePersonalizationVariant(manifest, config);
    } catch (e) {
      console.warn(e);
      window.lana?.log(`MEP Error parsing manifests: ${e.toString()}`);
    }
  });
  return Object.values(manifestObj).sort(compareExecutionOrder);
}

function handleFragmentCommand(command, a) {
  const { action, fragment, manifestId } = command;
  if (action === 'replace') {
    a.href = fragment;
    if (manifestId) a.dataset.manifestId = manifestId;
    return fragment;
  }
  if (action === 'remove') {
    if (manifestId) {
      a.parentElement.dataset.removedManifestId = manifestId;
    } else {
      a.parentElement.remove();
    }
  }
  return false;
}

async function applyPers(manifests, postLCP = false) {
  try {
    const config = getConfig$1();
    if (!postLCP) {
      const {
        mep: mepParam,
        mepHighlight,
        mepButton,
      } = Object.fromEntries(PAGE_URL.searchParams);
      config.mep = {
        handleFragmentCommand,
        preview: (mepButton !== 'off' && (config.env?.name !== 'prod' || mepButton)),
        override: mepParam ? decodeURIComponent(mepParam) : '',
        highlight: (mepHighlight !== undefined && mepHighlight !== 'false'),
        mepParam,
        targetEnabled: config.mep?.targetEnabled,
      };
    }

    if (!manifests?.length) return;
    let experiments = manifests;
    for (let i = 0; i < experiments.length; i += 1) {
      experiments[i] = await getPersConfig(experiments[i], config.mep?.override);
    }

    experiments = cleanAndSortManifestList(experiments);

    let results = [];

    for (const experiment of experiments) {
      const result = await categorizeActions(experiment);
      if (result) {
        results.push(result);
      }
    }
    results = results.filter(Boolean);

    config.mep.experiments ??= [];
    config.mep.experiments = experiments;
    config.mep.blocks = consolidateObjects(results, 'blocks', config.mep.blocks);
    config.mep.fragments = consolidateObjects(results, 'fragments', config.mep.fragments);
    config.mep.commands = consolidateArray(results, 'commands', config.mep.commands);

    if (!postLCP) handleCommands(config.mep.commands);
    deleteMarkedEls();

    const pznList = results.filter((r) => (r.experiment?.manifestType === TRACKED_MANIFEST_TYPE));
    if (!pznList.length) return;

    const pznVariants = pznList.map((r) => {
      const val = r.experiment.selectedVariantName.replace(TARGET_EXP_PREFIX, '').trim().slice(0, 15);
      return val === 'default' ? 'nopzn' : val;
    });
    const pznManifests = pznList.map((r) => {
      const val = r.experiment?.manifestOverrideName || r.experiment?.manifest;
      return getFileName(val).replace('.json', '').trim().slice(0, 15);
    });
    config.mep.martech = `|${pznVariants.join('--')}|${pznManifests.join('--')}`;
  } catch (e) {
    console.warn(e);
    window.lana?.log(`MEP Error: ${e.toString()}`);
  }
}

const personalization = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PERSONALIZATION_TAGS,
  TRACKED_MANIFEST_TYPE,
  appendJsonExt,
  applyPers,
  categorizeActions,
  cleanAndSortManifestList,
  deleteMarkedEls,
  getFileName,
  getPersConfig,
  handleCommands,
  handleFragmentCommand,
  matchGlob,
  normalizePath,
  parseConfig,
  preloadManifests,
  replaceInner
}, Symbol.toStringTag, { value: 'Module' }));

let config;
let createTag;
let getMetadata$3;
let loadBlock;
let loadStyle$1;
let sendAnalyticsFunc;

const createTabsContainer = (tabNames) => {
  const ol = createTag('ol');
  tabNames.forEach((name) => {
    const li = createTag('li', null, name);
    ol.appendChild(li);
  });
  const olDiv = createTag('div', null, ol);
  const outerDiv = createTag('div', null, olDiv);
  const divTabs = createTag('div', { class: 'tabs quiet' }, outerDiv);
  return createTag('div', { class: 'section tabs-background-transparent' }, divTabs);
};

const createTab = (content, tabName) => {
  const divTab = createTag('div', null, 'tab');
  const divTagName = createTag('div', null, tabName);
  const tab = createTag('div');
  tab.appendChild(divTab);
  tab.appendChild(divTagName);
  const sectionMeta = createTag('div', { class: 'section-metadata' }, tab);
  const topDiv = createTag('div', { class: 'section' });
  topDiv.append(content);
  topDiv.append(sectionMeta);
  return topDiv;
};

const getCookie$1 = (name) => document.cookie
  .split('; ')
  .find((row) => row.startsWith(`${name}=`))
  ?.split('=')[1];

const getAkamaiCode$1 = () => new Promise((resolve, reject) => {
  const urlParams = new URLSearchParams(window.location.search);
  const akamaiLocale = urlParams.get('akamaiLocale') || sessionStorage.getItem('akamai');
  if (akamaiLocale !== null) {
    resolve(akamaiLocale.toLowerCase());
  } else {
    /* c8 ignore next 5 */
    fetch('https://geo2.adobe.com/json/', { cache: 'no-cache' }).then((resp) => {
      if (resp.ok) {
        resp.json().then((data) => {
          const code = data.country.toLowerCase();
          sessionStorage.setItem('akamai', code);
          resolve(code);
        });
      } else {
        reject(new Error(`Something went wrong getting the akamai Code. Response status text: ${resp.statusText}`));
      }
    }).catch((error) => {
      reject(new Error(`Something went wrong getting the akamai Code. ${error.message}`));
    });
  }
});

// Determine if any of the locales can be linked to.
async function getAvailableLocales$1(locales) {
  const fallback = getMetadata$3('fallbackrouting') || config.fallbackRouting;

  const { prefix } = config.locale;
  let path = window.location.href.replace(`${window.location.origin}`, '');
  if (path.startsWith(prefix)) path = path.replace(prefix, '');

  const availableLocales = [];
  const pagesExist = [];
  locales.forEach((locale, index) => {
    const locPrefix = locale.prefix ? `/${locale.prefix}` : '';
    const localePath = `${locPrefix}${path}`;

    const pageExistsRequest = fetch(localePath, { method: 'HEAD' }).then((resp) => {
      if (resp.ok) {
        locale.url = localePath;
        availableLocales[index] = locale;
      } else if (fallback !== 'off') {
        locale.url = `${locPrefix}`;
        availableLocales[index] = locale;
      }
    });
    pagesExist.push(pageExistsRequest);
  });
  if (pagesExist.length > 0) await Promise.all(pagesExist);

  return availableLocales.filter((a) => !!a);
}

function getGeoroutingOverride() {
  const urlParams = new URLSearchParams(window.location.search);
  const param = urlParams.get('georouting');
  const georouting = param || getCookie$1('georouting');
  if (param === 'off') {
    const domain = window.location.host.endsWith('.adobe.com') ? 'domain=adobe.com' : '';
    const d = new Date();
    d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `georouting=${georouting};${expires};path=/;${domain}`;
  } else if (param === 'on') document.cookie = 'georouting=; expires= Thu, 01 Jan 1970 00:00:00 GMT';
  return georouting === 'off';
}

function decorateForOnLinkClick(link, urlPrefix, localePrefix) {
  link.addEventListener('click', () => {
    const modPrefix = urlPrefix || 'us';
    // set cookie so legacy code on adobecom still works properly.
    const domain = window.location.host === 'adobe.com'
      || window.location.host.endsWith('.adobe.com') ? 'domain=adobe.com' : '';
    document.cookie = `international=${modPrefix};path=/;${domain}`;
    link.closest('.dialog-modal').dispatchEvent(new Event('closeModal'));
    if (localePrefix !== undefined) {
      const modCurrPrefix = localePrefix || 'us';
      sendAnalyticsFunc(new Event(`Stay:${modPrefix.split('_')[0]}-${modCurrPrefix.split('_')[0]}|Geo_Routing_Modal`));
    }
  });
}

function getCodes$1(data) {
  return data.akamaiCodes.split(',').map((a) => a.toLowerCase().trim());
}

function getMatches$1(data, suppliedCode) {
  return data.reduce((rdx, locale) => {
    const localeCodes = getCodes$1(locale);
    if (localeCodes.some((code) => code === suppliedCode)) rdx.push(locale);
    return rdx;
  }, []);
}

function removeOnClickOutsideElement(element, event, button) {
  const func = (evt) => {
    if (event === evt) return; // ignore initial click event
    let targetEl = evt.target;
    while (targetEl) {
      if (targetEl === element) {
        // click inside
        return;
      }
      // Go up the DOM
      targetEl = targetEl.parentNode;
    }
    // This is a click outside.
    element.remove();
    button.setAttribute('aria-expanded', false);
    document.removeEventListener('click', func);
  };
  document.addEventListener('click', func);
}

function openPicker(button, locales, country, event, dir) {
  if (document.querySelector('.locale-modal-v2 .picker')) {
    return;
  }
  const list = createTag('ul', { class: 'picker', dir });
  locales.forEach((l) => {
    const lang = config.locales[l.prefix]?.ietf ?? '';
    const a = createTag('a', { lang, href: l.url }, `${country} - ${l.language}`);
    decorateForOnLinkClick(a, l.prefix);
    const li = createTag('li', {}, a);
    list.appendChild(li);
  });
  button.parentNode.insertBefore(list, button.nextSibling);
  const buttonRect = button.getBoundingClientRect();
  const spaceBelowButton = window.innerHeight - buttonRect.bottom;
  if (spaceBelowButton <= list.offsetHeight) {
    list.classList.add('top');
  }

  button.setAttribute('aria-expanded', true);
  removeOnClickOutsideElement(list, event, button);
}

function buildContent(currentPage, locale, geoData, locales) {
  const fragment = new DocumentFragment();
  const lang = config.locales[locale.prefix]?.ietf ?? '';
  const dir = config.locales[locale.prefix]?.dir ?? 'ltr';
  const geo = geoData.filter((c) => c.prefix === locale.prefix);
  const titleText = geo.length ? geo[0][currentPage.geo] : '';
  const title = createTag('h3', { lang, dir }, locale.title.replace('{{geo}}', titleText));
  const text = createTag('p', { class: 'locale-text', lang, dir }, locale.text);
  const flagFile = locale.globeGrid?.toLowerCase().trim() === 'on' ? 'globe-grid.png' : `flag-${locale.geo.replace('_', '-')}.svg`;
  const img = createTag('img', {
    class: 'icon-milo',
    width: 15,
    height: 15,
    alt: locale.button,
  });
  img.addEventListener(
    'error',
    () => (img.src = `${config.miloLibs || config.codeRoot}/features/georoutingv2/img/globe-grid.png`),
    { once: true },
  );
  img.src = `${config.miloLibs || config.codeRoot}/img/georouting/${flagFile}`;
  const span = createTag('span', { class: 'icon margin-inline-end' }, img);
  const mainAction = createTag('a', {
    class: 'con-button blue button-l', lang, role: 'button', 'aria-haspopup': !!locales, 'aria-expanded': false, href: '#',
  }, span);
  mainAction.append(locale.button);
  if (locales) {
    const downArrow = createTag('img', {
      class: 'icon-milo down-arrow',
      src: `${config.miloLibs || config.codeRoot}/ui/img/chevron.svg`,
      width: 15,
      height: 15,
    });
    span.appendChild(downArrow);
    mainAction.addEventListener('click', (e) => {
      e.preventDefault();
      openPicker(mainAction, locales, locale.button, e, dir);
    });
  } else {
    mainAction.href = locale.url;
    decorateForOnLinkClick(mainAction, locale.prefix);
  }

  const altAction = createTag('a', { lang, href: currentPage.url }, currentPage.button);
  decorateForOnLinkClick(altAction, currentPage.prefix, locale.prefix);
  const linkWrapper = createTag('div', { class: 'link-wrapper' }, mainAction);
  linkWrapper.appendChild(altAction);
  fragment.append(title, text, linkWrapper);
  return fragment;
}

async function getDetails$1(currentPage, localeMatches, geoData) {
  const availableLocales = await getAvailableLocales$1(localeMatches);
  if (!availableLocales.length) return null;
  const { innerWidth } = window;
  let svgDiv = null;
  if (innerWidth < 480) {
    const { default: getMobileBg } = await Promise.resolve().then(() => getMobileBg$1);
    svgDiv = createTag('div', { class: 'georouting-bg' }, getMobileBg());
  }
  const georoutingWrapper = createTag('div', { class: 'georouting-wrapper fragment', style: 'display:none;' }, svgDiv);
  currentPage.url = window.location.hash ? document.location.href : '#';
  if (availableLocales.length === 1) {
    const content = buildContent(currentPage, availableLocales[0], geoData);
    georoutingWrapper.appendChild(content);
    return georoutingWrapper;
  }
  const sortedLocales = availableLocales.sort((a, b) => a.languageOrder - b.languageOrder);
  const tabsContainer = createTabsContainer(sortedLocales.map((l) => l.language));
  georoutingWrapper.appendChild(tabsContainer);

  sortedLocales.forEach((locale) => {
    const content = buildContent(currentPage, locale, geoData, sortedLocales);
    const tab = createTab(content, locale.language);
    georoutingWrapper.appendChild(tab);
  });
  return georoutingWrapper;
}

async function showModal$1(details) {
  const { miloLibs, codeRoot } = config;

  const tabs = details.querySelector('.tabs');
  const promises = [
    tabs ? loadBlock(tabs) : null,
    tabs ? loadStyle$1(`${miloLibs || codeRoot}/blocks/section-metadata/section-metadata.css`) : null,
    loadStyle$1(`${miloLibs || codeRoot}/features/georoutingv2/georoutingv2.css`),
  ];
  await Promise.all(promises);
  // eslint-disable-next-line import/no-cycle
  const { getModal, sendAnalytics } = await Promise.resolve().then(() => modal);
  sendAnalyticsFunc = sendAnalytics;
  return getModal(null, { class: 'locale-modal-v2', id: 'locale-modal-v2', content: details, closeEvent: 'closeModal' });
}

async function loadGeoRouting$1(
  conf,
  createTagFunc,
  getMetadataFunc,
  loadBlockFunc,
  loadStyleFunc,
) {
  if (getGeoroutingOverride()) return;
  config = conf;
  createTag = createTagFunc;
  getMetadata$3 = getMetadataFunc;
  loadBlock = loadBlockFunc;
  loadStyle$1 = loadStyleFunc;

  const resp = await fetch(`${config.contentRoot ?? ''}/georoutingv2.json`);
  if (!resp.ok) {
    // eslint-disable-next-line import/no-cycle
    const { default: loadGeoRoutingOld } = await Promise.resolve().then(() => georouting);
    loadGeoRoutingOld(config, createTag, getMetadata$3);
    return;
  }
  const json = await resp.json();

  const { locale } = config;

  const urlLocale = locale.prefix.replace('/', '');
  const storedInter = getCookie$1('international');
  const storedLocale = storedInter === 'us' ? '' : storedInter;

  const urlGeoData = json.georouting.data.find((d) => d.prefix === urlLocale);
  if (!urlGeoData) return;

  if (storedLocale || storedLocale === '') {
    const urlLocaleGeo = urlLocale.split('_')[0];
    const storedLocaleGeo = storedLocale.split('_')[0];
    // Show modal when url and cookie disagree
    if (urlLocaleGeo !== storedLocaleGeo) {
      const localeMatches = json.georouting.data.filter(
        (d) => d.prefix === storedLocale,
      );
      const details = await getDetails$1(urlGeoData, localeMatches, json.geos.data);
      if (details) {
        await showModal$1(details);
        sendAnalyticsFunc(
          new Event(`Load:${storedLocaleGeo || 'us'}-${urlLocaleGeo || 'us'}|Geo_Routing_Modal`),
        );
      }
    }
    return;
  }

  // Show modal when derived countries from url locale and akamai disagree
  try {
    const akamaiCode = await getAkamaiCode$1();
    if (akamaiCode && !getCodes$1(urlGeoData).includes(akamaiCode)) {
      const localeMatches = getMatches$1(json.georouting.data, akamaiCode);
      const details = await getDetails$1(urlGeoData, localeMatches, json.geos.data);
      if (details) {
        await showModal$1(details);
        sendAnalyticsFunc(
          new Event(`Load:${urlLocale || 'us'}-${akamaiCode || 'us'}|Geo_Routing_Modal`),
        );
      }
    }
  } catch (e) {
    window.lana?.log(e.message);
  }
}

const georoutingv2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: loadGeoRouting$1,
  getCookie: getCookie$1
}, Symbol.toStringTag, { value: 'Module' }));

// A gently modified version of the dynamic subsetting loader from Adobe Fonts
function dynamicTypekit(kitId, d = document) {
  const config = { kitId, scriptTimeout: 3000, async: true };
  /* c8 ignore next 1 */
  const h = d.documentElement; const t = setTimeout(() => { h.className = `${h.className.replace(/\bwf-loading\b/g, '')} wf-inactive`; }, config.scriptTimeout); const tk = d.createElement('script'); let f = false; const s = d.getElementsByTagName('script')[0]; let a; h.className += ' wf-loading'; tk.src = `https://use.typekit.net/${config.kitId}.js`; tk.async = true; tk.onload = tk.onreadystatechange = function () { a = this.readyState; if (f || a && a != 'complete' && a != 'loaded') return; f = true; clearTimeout(t); try { Typekit.load(config); } catch (e) {} }; s.parentNode.insertBefore(tk, s);
  return h;
}

/**
 * Set the fonts of the page.
 *
 * Determines if the font should be a classic CSS integration
 * or if it should be a JS integration (dynamic subsetting) for CJK.
 *
 * @param {Object} locale the locale details
 */
function loadFonts(locale, loadStyle) {
  const tkSplit = locale.tk.split('.');
  if (tkSplit[1] === 'css') {
    return new Promise((resolve) => {
      loadStyle(`https://use.typekit.net/${locale.tk}`, resolve);
    });
  }
  return dynamicTypekit(locale.tk);
}

const fonts = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: loadFonts
}, Symbol.toStringTag, { value: 'Module' }));

function updatePreviewButton() {
  const selectedInputs = document.querySelectorAll(
    '.mep-popup input[type="radio"]:checked, .mep-popup input[type="text"]',
  );
  const manifestParameter = [];

  selectedInputs.forEach((selected) => {
    let { value } = selected;
    if (selected.getAttribute('id') === 'new-manifest') {
      if (selected.value !== '') {
        try {
          const newManifest = new URL(value);
          if (newManifest) {
            value = newManifest.pathname;
          }
        } catch (e) {
          // do nothing
        }
        manifestParameter.push(value);
      }
    } else {
      value = `${selected.getAttribute('name')}--${value}`;
      manifestParameter.push(value);
    }
  });

  const simulateHref = new URL(window.location.href);
  simulateHref.searchParams.set('mep', manifestParameter.join('---'));

  const mepHighlightCheckbox = document.querySelector(
    '.mep-popup input[type="checkbox"]#mepHighlightCheckbox',
  );
  document.body.dataset.mepHighlight = mepHighlightCheckbox.checked;
  if (mepHighlightCheckbox.checked) {
    simulateHref.searchParams.set('mepHighlight', true);
  } else {
    simulateHref.searchParams.delete('mepHighlight');
  }

  const mepPreviewButtonCheckbox = document.querySelector(
    '.mep-popup input[type="checkbox"]#mepPreviewButtonCheckbox',
  );
  if (mepPreviewButtonCheckbox.checked) {
    simulateHref.searchParams.set('mepButton', 'off');
  } else {
    simulateHref.searchParams.delete('mepButton');
  }

  document
    .querySelector('.mep-popup a.con-button')
    .setAttribute('href', simulateHref.href);
}

function getRepo() {
  const [, repo] = new URL(window.location.href).hostname.split('--');
  if (repo) return repo;
  try {
    const sidekick = document.querySelector('helix-sidekick');
    if (sidekick) {
      const [, sidekickRepo] = new URL(JSON.parse(sidekick.getAttribute('status'))?.live.url).hostname.split('--');
      return sidekickRepo;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Error getting repo from sidekick', e);
  }
  return false;
}

async function getEditManifestUrl(a, w) {
  const repo = getRepo();
  if (!repo) {
    w.location = a.dataset.manifestPath;
    return false;
  }
  const response = await fetch(`https://admin.hlx.page/status/adobecom/${repo}/main${a.dataset.manifestPath}?editUrl=auto`);
  const body = await response.json();
  const editUrl = body?.edit?.url;
  if (editUrl) {
    w.location = editUrl;
    a.href = editUrl;
    return true;
  }
  w.location = a.dataset.manifestUrl;
  return false;
}

function addPillEventListeners(div) {
  div.querySelectorAll('.mep-popup input[type="radio"], .mep-popup input[type="checkbox"]').forEach((input) => {
    input.addEventListener('change', updatePreviewButton);
  });

  div.querySelectorAll('.mep-popup input[type="text"]').forEach((input) => {
    input.addEventListener('keyup', updatePreviewButton);
  });

  div.querySelector('.mep-manifest.mep-badge').addEventListener('click', () => {
    div.classList.toggle('mep-hidden');
  });

  div.querySelector('.mep-close').addEventListener('click', () => {
    document.body.removeChild(document.querySelector('.mep-preview-overlay'));
  });

  div.querySelector('.mep-toggle-advanced').addEventListener('click', () => {
    document.querySelector('.mep-advanced-container').classList.toggle('mep-advanced-open');
  });

  div.querySelectorAll('a[data-manifest-path]').forEach((a) => {
    a.addEventListener('click', () => {
      if (a.getAttribute('href')) return false;
      const w = window.open('', '_blank');
      w.document.write(`<html><head></head><body>
        Please wait while we redirect you. 
        If you are not redirected, please check that you are signed into the AEM sidekick
        and try again.
        </body></html>`);
      w.document.close();
      w.focus();
      getEditManifestUrl(a, w);
      return true;
    });
  });
}

function createPreviewPill(manifests) {
  const overlay = createTag$1('div', { class: 'mep-preview-overlay static-links', style: 'display: none;' });
  document.body.append(overlay);
  const div = document.createElement('div');
  div.classList.add('mep-hidden');
  let manifestList = '';
  const manifestParameter = [];
  manifests?.forEach((manifest) => {
    const {
      variantNames,
      manifestPath = manifest.manifest,
      selectedVariantName,
      name,
      manifestType,
      manifestUrl,
      manifestOverrideName,
    } = manifest;
    let radio = '';
    variantNames.forEach((variant) => {
      const checked = {
        attribute: '',
        class: '',
      };
      if (variant === selectedVariantName) {
        checked.attribute = 'checked="checked"';
        checked.class = 'class="mep-manifest-selected-variant"';
        manifestParameter.push(`${manifestPath}--${variant}`);
      }
      radio += `<div>
        <input type="radio" name="${manifestPath}" value="${variant}" id="${manifestPath}--${variant}" ${checked.attribute}>
        <label for="${manifestPath}--${variant}" ${checked.class}>${variant}</label>
      </div>`;
    });
    const checked = {
      attribute: '',
      class: '',
    };
    if (!variantNames.includes(selectedVariantName)) {
      checked.attribute = 'checked="checked"';
      checked.class = 'class="mep-manifest-selected-variant"';
      manifestParameter.push(`${manifestPath}--default`);
    }
    radio += `<div>
      <input type="radio" name="${manifestPath}" value="default" id="${manifestPath}--default" ${checked.attribute}>
      <label for="${manifestPath}--default" ${checked.class}>Default (control)</label>
    </div>`;

    const manifestFileName = getFileName(manifestPath);
    const targetTitle = name ? `${name}<br><i>${manifestFileName}</i>` : manifestFileName;
    const scheduled = manifest.event
      ? `<p>Scheduled - ${manifest.disabled ? 'inactive' : 'active'}</p>
         <p>On: ${manifest.event.start?.toLocaleString()} - <a target= "_blank" href="?instant=${manifest.event.start?.toISOString()}">instant</a></p>
         <p>Off: ${manifest.event.end?.toLocaleString()}</p>` : '';
    let analyticsTitle = '';
    if (manifestType === TRACKED_MANIFEST_TYPE) {
      analyticsTitle = 'N/A for this manifest type';
    } else if (manifestOverrideName) {
      analyticsTitle = manifestOverrideName;
    } else {
      analyticsTitle = manifestFileName.replace('.json', '').slice(0, 20);
    }
    manifestList += `<div class="mep-manifest-info" title="Full url: ${manifestUrl}&#013;Analytics manifest name: ${analyticsTitle}">
      <div class="mep-manifest-title">
        ${targetTitle}
        <i></i>
        <a class="mep-edit-manifest" data-manifest-url="${manifestUrl}" data-manifest-path="${manifestPath}" target="_blank" title="Open manifest">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0,0,256,256" width="16px" height="16px" fill-rule="nonzero"><g transform=""><g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(8.53333,8.53333)"><path d="M22.82813,3c-0.51175,0 -1.02356,0.19544 -1.41406,0.58594l-2.41406,2.41406l5,5l2.41406,-2.41406c0.781,-0.781 0.781,-2.04713 0,-2.82812l-2.17187,-2.17187c-0.3905,-0.3905 -0.90231,-0.58594 -1.41406,-0.58594zM17,8l-11.74023,11.74023c0,0 0.91777,-0.08223 1.25977,0.25977c0.342,0.342 0.06047,2.58 0.48047,3c0.42,0.42 2.64389,0.12436 2.96289,0.44336c0.319,0.319 0.29688,1.29688 0.29688,1.29688l11.74023,-11.74023zM4,23l-0.94336,2.67188c-0.03709,0.10544 -0.05623,0.21635 -0.05664,0.32813c0,0.55228 0.44772,1 1,1c0.11177,-0.00041 0.22268,-0.01956 0.32813,-0.05664c0.00326,-0.00128 0.00652,-0.00259 0.00977,-0.00391l0.02539,-0.00781c0.00196,-0.0013 0.00391,-0.0026 0.00586,-0.00391l2.63086,-0.92773l-1.5,-1.5z"></path></g></g></g></svg>
        </a>
        ${scheduled}
      </div>
      <div class="mep-manifest-variants">${radio}</div>
    </div>`;
  });
  const config = getConfig$1();
  let targetOnText = config.mep.targetEnabled ? 'on' : 'off';
  if (config.mep.targetEnabled === 'gnav') targetOnText = 'on for gnav only';
  const personalizationOn = getMetadata$4('personalization');
  const personalizationOnText = personalizationOn && personalizationOn !== '' ? 'on' : 'off';
  const simulateHref = new URL(window.location.href);
  simulateHref.searchParams.set('mep', manifestParameter.join('---'));

  let mepHighlightChecked = '';
  if (config.mep?.highlight) {
    mepHighlightChecked = 'checked="checked"';
    document.body.dataset.mepHighlight = true;
  }

  div.innerHTML = `
    <div class="mep-manifest mep-badge">
      <span class="mep-open"></span>
      <div class="mep-manifest-count">${manifests?.length || 0} Manifest(s) served</div>
    </div>
    <div class="mep-popup">
    <div class="mep-popup-header">
      <div>
        <h4>${manifests?.length || 0} Manifest(s) served</h4>
        <span class="mep-close"></span>
        <div class="mep-manifest-page-info-title">Page Info:</div>
        <div>Target integration feature is ${targetOnText}</div>
        <div>Personalization feature is ${personalizationOnText}</div>
        <div>Page's Locale is ${config.locale.ietf}</div>
      </div>
    </div>
    <div class="mep-manifest-list">
      <div class="mep-manifest-info">
        <div class="mep-manifest-variants">
          <input type="checkbox" name="mepHighlight" id="mepHighlightCheckbox" ${mepHighlightChecked} value="true"> <label for="mepHighlightCheckbox">Highlight changes</label>
        </div>
      </div>
      ${manifestList}
      <div class="mep-advanced-container">
        <div class="mep-toggle-advanced">Advanced options</div>
        <div class="mep-manifest-info mep-advanced-options">
          <div>
            Optional: new manifest location or path
          </div>
          <div class="mep-manifest-variants">
            <div>
              <input type="text" name="new-manifest" id="new-manifest">
            </div>
          </div>
        </div>
        <div class="mep-manifest-info">
          <div class="mep-manifest-variants mep-advanced-options">
            <input type="checkbox" name="mepPreviewButtonCheckbox" id="mepPreviewButtonCheckbox" value="off"> <label for="mepPreviewButtonCheckbox">add mepButton=off to preview link</label>
          </div>
        </div>
      </div>
    </div>
    <div class="dark">
      <a class="con-button outline button-l" href="${simulateHref.href}" title="Preview above choices">Preview</a>
    </div>`;
  overlay.append(div);
  addPillEventListeners(div);
}

function addHighlightData(manifests) {
  manifests.forEach(({ selectedVariant, manifest }) => {
    const manifestName = getFileName(manifest);

    const updateManifestId = (selector, prop = 'manifestId') => {
      document.querySelectorAll(selector).forEach((el) => (el.dataset[prop] = manifestName));
    };

    selectedVariant?.replacefragment?.forEach(
      ({ val }) => updateManifestId(`[data-path*="${val}"]`),
    );

    selectedVariant?.useblockcode?.forEach(({ selector }) => {
      if (selector) updateManifestId(`.${selector}`, 'codeManifestId');
    });

    selectedVariant?.updatemetadata?.forEach(({ selector }) => {
      if (selector === 'gnav-source') updateManifestId('header, footer');
    });
    // eslint-disable-next-line max-len
    document.querySelectorAll(`.section[class*="merch-cards"] .fragment[data-manifest-id="${manifestName}"] merch-card`)
      .forEach((el) => (el.dataset.manifestId = manifestName));
  });
}

async function decoratePreviewMode() {
  const { miloLibs, codeRoot, mep } = getConfig$1();
  loadStyle$2(`${miloLibs || codeRoot}/features/personalization/preview.css`);
  createPreviewPill(mep?.experiments);
  if (mep?.experiments) addHighlightData(mep.experiments);
}

const preview = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: decoratePreviewMode
}, Symbol.toStringTag, { value: 'Module' }));

let fetched = false;
let linkData = null;

const fetchSeoLinks = async (path) => {
  if (!path) return null;
  if (!fetched) {
    const resp = await fetch(path);
    if (resp.ok) {
      const json = await resp.json();
      linkData = json.data;
    }
    fetched = true;
  }
  return linkData;
};

async function init$4(path, area = document) {
  const seoLinks = await fetchSeoLinks(path);
  if (!seoLinks) return;
  const { origin } = window.location;
  const pageLinks = area.querySelectorAll('a:not([href^="/"])');
  [...pageLinks].forEach((link) => {
    seoLinks
      .filter((s) => link.href.startsWith(s.domain)
        || (s.domain === 'off-origin' && !link.href.startsWith(origin)))
      .forEach((s) => {
        if (s.rel) link.setAttribute('rel', s.rel);
        if (s.window && !link.getAttribute('target')) link.setAttribute('target', s.window);
      });
  });
}

const links = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: init$4
}, Symbol.toStringTag, { value: 'Module' }));

/* eslint-disable no-console */

const hasTextNode = (element) => [...element.childNodes]
  .some(({ nodeType, textContent }) => nodeType === Node.TEXT_NODE && textContent.trim() !== '');

function findTextElements(element = document.body) {
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'header' || tagName === 'footer'
    || element.classList.contains('jpwordwrap-disabled')
  ) {
    return [];
  }

  return Array.from(element.children).reduce((result, child) => (
    hasTextNode(child)
      ? [...result, child]
      : [...result, ...findTextElements(child)]
  ), []);
}

/**
 * Update the model to control line breaks occurring for the specified word.
 */
function updateParserModel(parser, pattern, score, markerSymbol = '#') {
  const markerPos = pattern.indexOf(markerSymbol);
  if (markerPos === -1) {
    console.warn('No marker symbol found in the line break pattern string');
    return;
  }

  if (markerPos !== pattern.lastIndexOf('#')) {
    console.warn('Two or more marker symbols cannot be specified. Only the first marker is applied');
  }

  const former = pattern.slice(Math.max(markerPos - 3, 0), markerPos);
  const latter = pattern.slice(markerPos + 1, Math.min(markerPos + 4, pattern.length));

  if (former.length < 2 || latter.length < 2) {
    console.warn('At least two characters must be specified before and after the marker symbol');
    return;
  }

  if (former.length === 3) {
    parser.model.set(`TW1:${former}`, score);
  } else if (former.length === 2) {
    parser.model.set(`BW1:${former}`, score);
  }

  if (latter.length === 3) {
    parser.model.set(`TW4:${latter}`, score);
  } else if (latter.length === 2) {
    parser.model.set(`BW3:${latter}`, score);
  }
}

function hasFlexOrGrid(element) {
  const elStyles = getComputedStyle(element);

  return (elStyles.display === 'flex' || elStyles.display === 'grid');
}

function isFirefox() {
  return navigator.userAgent.includes('Firefox');
}

/**
 * Check if a word wrap has been applied to an element.
 */
function isWordWrapApplied(element) {
  return !!element.querySelector('wbr');
}

/**
 * Check if a balanced word wrap has been applied to an element.
 */
function isBalancedWordWrapApplied(element) {
  return !!element.querySelector('wbr[class^=jpn-balanced-wbr]');
}

/**
 * Apply smart line-breaking algorithm depending on the given options.
 */
async function applyJapaneseLineBreaks(config, options = {}) {
  const { miloLibs, codeRoot } = config;
  const {
    scopeArea = document,
    budouxThres = 2000,
    bwEnabled = false,
    budouxExcludeSelector = null,
    bwExcludeSelector = 'p',
    lineBreakOkPatterns = [],
    lineBreakNgPatterns = [],
  } = options;
  const base = miloLibs || codeRoot;

  // The thresould value to control word break granularity for long semantic blocks.
  const { loadDefaultJapaneseParser } = await import(`${base}/deps/budoux-index-ja.min.js`);
  const parser = loadDefaultJapaneseParser();

  // Find elements that contains a text node directly under its child node.
  const textElements = findTextElements(
    scopeArea instanceof Document ? scopeArea.body : scopeArea,
  );
  const budouxExcludeElements = new Set();
  const bwExcludeElements = new Set();

  // Find BudouX disabled elements
  if (budouxExcludeSelector) {
    scopeArea.querySelectorAll(budouxExcludeSelector).forEach((el) => {
      budouxExcludeElements.add(el);
    });
  }

  // Find Blanced Word Wrap disabled elements
  if (bwEnabled && bwExcludeSelector) {
    scopeArea.querySelectorAll(bwExcludeSelector).forEach((el) => {
      bwExcludeElements.add(el);
    });
  }

  // Update model based on given patterns
  const SCORE = Number.MAX_VALUE;
  lineBreakOkPatterns.forEach((p) => {
    updateParserModel(parser, p, SCORE);
  });
  lineBreakNgPatterns.forEach((p) => {
    updateParserModel(parser, p, -SCORE);
  });

  // Apply budoux to target selector
  textElements.forEach((el) => {
    if (
      budouxExcludeElements.has(el)
      || isWordWrapApplied(el)
      || (isFirefox() && hasFlexOrGrid(el))
    ) return;
    parser.applyElement(el, { threshold: budouxThres });
  });

  if (bwEnabled) {
    const BalancedWordWrapper = (await import(`${base}/deps/bw2.min.js`)).default;
    const bw2 = new BalancedWordWrapper();
    // Apply balanced word wrap to target selector
    textElements.forEach((el) => {
      if (
        bwExcludeElements.has(el)
        || isBalancedWordWrapApplied(el)
        || (isFirefox() && hasFlexOrGrid(el))
      ) return;
      bw2.applyElement(el);
    });
  }
}

/**
 * Apply smart line-breaking algorithm by inserting <wbr> between semantic blocks.
 * This allows browsers to break japanese sentences correctly.
 */
async function controlJapaneseLineBreaks(config, scopeArea = document) {
  const disabled = getMetadata$4('jpwordwrap:disabled') === 'true' || false;
  const budouxThres = Number(getMetadata$4('jpwordwrap:budoux-thres')) || 2000;
  const budouxExcludeSelector = getMetadata$4('jpwordwrap:budoux-exclude-selector');
  const bwEnabled = getMetadata$4('jpwordwrap:bw-enabled') === 'true' || false;
  const bwExcludeSelector = getMetadata$4('jpwordwrap:bw-exclude-selector') || 'p';
  const lineBreakOkPatterns = (getMetadata$4('jpwordwrap:line-break-ok') || '').split(',');
  const lineBreakNgPatterns = (getMetadata$4('jpwordwrap:line-break-ng') || '').split(',');

  if (disabled) return;

  await applyJapaneseLineBreaks(config, {
    scopeArea,
    budouxThres,
    budouxExcludeSelector,
    bwEnabled,
    bwExcludeSelector,
    lineBreakOkPatterns,
    lineBreakNgPatterns,
  });
}

const japaneseWordWrap = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  applyJapaneseLineBreaks,
  default: controlJapaneseLineBreaks,
  isBalancedWordWrapApplied,
  isWordWrapApplied
}, Symbol.toStringTag, { value: 'Module' }));

// code from https://github.com/adobe/helix-rum-js/blob/main/src/index.js
function sampleRUM(checkpoint, data = {}) {
  const SESSION_STORAGE_KEY = 'aem-rum';
  sampleRUM.baseURL = sampleRUM.baseURL || new URL(window.RUM_BASE == null ? 'https://rum.hlx.page' : window.RUM_BASE, window.location);
  sampleRUM.defer = sampleRUM.defer || [];
  const defer = (fnname) => {
    sampleRUM[fnname] = sampleRUM[fnname]
      || ((...args) => sampleRUM.defer.push({ fnname, args }));
  };
  /* c8 ignore start */
  sampleRUM.drain = sampleRUM.drain
    || ((dfnname, fn) => {
      sampleRUM[dfnname] = fn;
      sampleRUM.defer
        .filter(({ fnname }) => dfnname === fnname)
        .forEach(({ fnname, args }) => sampleRUM[fnname](...args));
    });
  sampleRUM.always = sampleRUM.always || [];
  sampleRUM.always.on = (chkpnt, fn) => {
    sampleRUM.always[chkpnt] = fn;
  };
  sampleRUM.on = (chkpnt, fn) => {
    sampleRUM.cases[chkpnt] = fn;
  };
  /* c8 ignore stop */
  defer('observe');
  defer('cwv');
  try {
    window.hlx = window.hlx || {};
    if (!window.hlx.rum) {
      const usp = new URLSearchParams(window.location.search);
      const weight = (usp.get('rum') === 'on') ? 1 : 100; // with parameter, weight is 1. Defaults to 100.
      const id = Array.from({ length: 75 }, (_, i) => String.fromCharCode(48 + i)).filter((a) => /\d|[A-Z]/i.test(a)).filter(() => Math.random() * 75 > 70).join('');
      const random = Math.random();
      const isSelected = (random * weight < 1);
      const firstReadTime = Date.now();
      const urlSanitizers = {
        full: () => window.location.href,
        origin: () => window.location.origin,
        path: () => window.location.href.replace(/\?.*$/, ''),
      };
      // eslint-disable-next-line max-len
      const rumSessionStorage = sessionStorage.getItem(SESSION_STORAGE_KEY) ? JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY)) : {};
      rumSessionStorage.pages = rumSessionStorage.pages ? rumSessionStorage.pages + 1 : 1;
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(rumSessionStorage));
      // eslint-disable-next-line object-curly-newline, max-len
      window.hlx.rum = { weight, id, random, isSelected, firstReadTime, sampleRUM, sanitizeURL: urlSanitizers[window.hlx.RUM_MASK_URL || 'path'], rumSessionStorage };
    }

    const { weight, id, firstReadTime } = window.hlx.rum;
    if (window.hlx && window.hlx.rum && window.hlx.rum.isSelected) {
      const knownProperties = ['weight', 'id', 'referer', 'checkpoint', 't', 'source', 'target', 'cwv', 'CLS', 'FID', 'LCP', 'INP', 'TTFB'];
      const sendPing = (pdata = data) => {
        // eslint-disable-next-line object-curly-newline, max-len, no-use-before-define
        const body = JSON.stringify({ weight, id, referer: window.hlx.rum.sanitizeURL(), checkpoint, t: (Date.now() - firstReadTime), ...data }, knownProperties);
        const url = new URL(`.rum/${weight}`, sampleRUM.baseURL).href;
        navigator.sendBeacon(url, body);
        // eslint-disable-next-line no-console
        console.debug(`ping:${checkpoint}`, pdata);
      };
      sampleRUM.cases = sampleRUM.cases || {
        load: () => sampleRUM('pagesviewed', { source: window.hlx.rum.rumSessionStorage.pages }) || true,
        cwv: () => sampleRUM.cwv(data) || true,
        /* c8 ignore next 7 */
        lazy: () => {
          // use classic script to avoid CORS issues
          const script = document.createElement('script');
          script.src = new URL('.rum/@adobe/helix-rum-enhancer@^1/src/index.js', sampleRUM.baseURL).href;
          document.head.appendChild(script);
          return true;
        },
      };
      sendPing(data);
      if (sampleRUM.cases[checkpoint]) {
        sampleRUM.cases[checkpoint]();
      }
    }
    if (sampleRUM.always[checkpoint]) {
      sampleRUM.always[checkpoint](data);
    }
  } catch (error) {
    // something went wrong
  }
}

/* c8 ignore start */
function addRumListeners() {
  window.addEventListener('load', () => sampleRUM('load'));

  window.addEventListener('unhandledrejection', (event) => {
    sampleRUM('error', { source: event.reason.sourceURL, target: event.reason.line });
  });

  window.addEventListener('error', (event) => {
    sampleRUM('error', { source: event.filename, target: event.lineno });
  });
}
/* c8 ignore stop */

sampleRUM('top');

const samplerum = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  addRumListeners,
  sampleRUM
}, Symbol.toStringTag, { value: 'Module' }));

function stylePublish(sk) {
  const style = new CSSStyleSheet();
  style.replaceSync(`
    :host {
      --bg-color: rgb(129 27 14);
      --text-color: #fff0f0;
      color-scheme: light dark;
    }
    .publish.plugin {
      order: 100;
    }
    .publish.plugin button {
      background: var(--bg-color);
      border-color: #b46157;
      color: var(--text-color);
      position: relative;
    }
    .publish.plugin button:hover {
      background-color: var(--hlx-sk-button-hover-bg);
      border-color: unset;
      color: var(--hlx-sk-button-hover-color);
    }
    .publish.plugin button > span {
      display: none;
      background: var(--bg-color);
      border-radius: 4px;
      line-height: 1.2rem;
      padding: 8px 12px;
      position: absolute;
      top: 34px;
      left: 50%;
      transform: translateX(-50%);
      width: 150px;
      white-space: pre-wrap;
    }
    .publish.plugin button:hover > span {
      display: block;
      color: var(--text-color);
    }
    .publish.plugin button > span:before {
      content: '';
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 6px solid var(--bg-color);
      position: absolute;
      text-align: center;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
    }
  `);
  sk.shadowRoot.adoptedStyleSheets = [style];
  setTimeout(() => {
    const btn = sk.shadowRoot.querySelector('.publish.plugin button');
    btn?.insertAdjacentHTML('beforeend', `
      <span>Are you sure? This will publish to production.</span>
    `);
  }, 500);
}

// loadScript and loadStyle are passed in to avoid circular dependencies
function init$3({ createTag, loadBlock, loadScript, loadStyle }) {
  // manifest v3
  const sendToCaasListener = async (e) => {
    const { host, project, ref: branch, repo, owner } = e.detail.data.config;
    // eslint-disable-next-line import/no-unresolved
    const { sendToCaaS } = await import('https://milo.adobe.com/tools/send-to-caas/send-to-caas.js');
    sendToCaaS({ host, project, branch, repo, owner }, loadScript, loadStyle);
  };

  const checkSchemaListener = async () => {
    const schema = document.querySelector('script[type="application/ld+json"]');
    if (schema === null) return;
    const resultsUrl = 'https://search.google.com/test/rich-results?url=';
    window.open(`${resultsUrl}${encodeURIComponent(window.location.href)}`, 'check-schema');
  };

  const preflightListener = async () => {
    const preflight = createTag('div', { class: 'preflight' });
    const content = await loadBlock(preflight);

    const { getModal } = await Promise.resolve().then(() => modal);
    getModal(null, { id: 'preflight', content, closeEvent: 'closeModal' });
  };

  // Support for legacy manifest v2 - Delete once everyone is migrated to v3
  document.addEventListener('send-to-caas', async (e) => {
    const { host, project, branch, repo, owner } = e.detail;
    const { sendToCaaS } = await Promise.resolve().then(() => sendToCaas);
    sendToCaaS({ host, project, branch, repo, owner }, loadScript, loadStyle);
  });

  const sk = document.querySelector('helix-sidekick');

  // Add plugin listeners here
  sk.addEventListener('custom:send-to-caas', sendToCaasListener);
  sk.addEventListener('custom:check-schema', checkSchemaListener);
  sk.addEventListener('custom:preflight', preflightListener);

  // Color code publish button
  stylePublish(sk);
}

const sidekick = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: init$3
}, Symbol.toStringTag, { value: 'Module' }));

/* eslint-disable import/no-cycle */

const FOCUSABLES = 'a:not(.hide-video), button, input, textarea, select, details, [tabindex]:not([tabindex="-1"]';
const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
  <g transform="translate(-10500 3403)">
    <circle cx="10" cy="10" r="10" transform="translate(10500 -3403)" fill="#707070"/>
    <line y1="8" x2="8" transform="translate(10506 -3397)" fill="none" stroke="#fff" stroke-width="2"/>
    <line x1="8" y1="8" transform="translate(10506 -3397)" fill="none" stroke="#fff" stroke-width="2"/>
  </g>
</svg>`;

let isDelayedModal = false;

function findDetails(hash, el) {
  const id = hash.replace('#', '');
  const a = el || document.querySelector(`a[data-modal-hash="${hash}"]`);
  const path = a?.dataset.modalPath || localizeLink(getMetadata$4(`-${id}`));
  return { id, path, isHash: hash === window.location.hash };
}

function sendAnalytics(event) {
  // eslint-disable-next-line no-underscore-dangle
  window._satellite?.track('event', {
    xdm: {},
    data: {
      web: { webInteraction: { name: event?.type } },
      _adobe_corpnew: { digitalData: event?.data },
    },
  });
}

function closeModal(modal) {
  const { id } = modal;
  const closeEvent = new Event('milo:modal:closed');
  window.dispatchEvent(closeEvent);

  document.querySelectorAll(`#${id}`).forEach((mod) => {
    if (mod.classList.contains('dialog-modal')) {
      const modalCurtain = document.querySelector(`#${id}~.modal-curtain`);
      if (modalCurtain) {
        modalCurtain.remove();
      }
      mod.remove();
    }
    document.querySelector(`[data-modal-hash="#${mod.id}"]`)?.focus();
  });

  if (!document.querySelectorAll('.modal-curtain').length) {
    document.body.classList.remove('disable-scroll');
  }

  [...document.querySelectorAll('header, main, footer')]
    .forEach((element) => element.removeAttribute('aria-disabled'));

  const hashId = window.location.hash.replace('#', '');
  if (hashId === modal.id) window.history.pushState('', document.title, `${window.location.pathname}${window.location.search}`);
  isDelayedModal = false;
}

function isElementInView(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0
    && rect.left >= 0
    && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function getCustomModal(custom, dialog) {
  const { miloLibs, codeRoot } = getConfig$1();
  loadStyle$2(`${miloLibs || codeRoot}/blocks/modal/modal.css`);
  if (custom.id) dialog.id = custom.id;
  if (custom.class) dialog.classList.add(custom.class);
  if (custom.closeEvent) {
    dialog.addEventListener(custom.closeEvent, () => {
      closeModal(dialog);
    });
  }
  dialog.append(custom.content);
}

async function getPathModal(path, dialog) {
  const block = createTag$1('a', { href: path });
  dialog.append(block);

  // eslint-disable-next-line import/no-cycle
  const { default: getFragment } = await Promise.resolve().then(() => fragment);
  await getFragment(block);
}

async function getModal(details, custom) {
  if (!(details?.path || custom)) return null;
  const { id } = details || custom;

  const dialog = createTag$1('div', { class: 'dialog-modal', id });
  const loadedEvent = new Event('milo:modal:loaded');

  if (custom) getCustomModal(custom, dialog);
  if (details) await getPathModal(details.path, dialog);
  if (isDelayedModal) {
    dialog.classList.add('delayed-modal');
    const mediaBlock = dialog.querySelector('div.media');
    if (mediaBlock) {
      mediaBlock.classList.add('in-modal');
      const { miloLibs, codeRoot } = getConfig$1();
      const base = miloLibs || codeRoot;
      loadStyle$2(`${base}/styles/rounded-corners.css`);
    }
  }

  const localeModal = id?.includes('locale-modal') ? 'localeModal' : 'milo';
  const analyticsEventName = window.location.hash ? window.location.hash.replace('#', '') : localeModal;
  const close = createTag$1('button', {
    class: 'dialog-close',
    'aria-label': 'Close',
    'daa-ll': `${analyticsEventName}:modalClose:buttonClose`,
  }, CLOSE_ICON);

  const focusVisible = { focusVisible: true };
  const focusablesOnLoad = [...dialog.querySelectorAll(FOCUSABLES)];
  const titleOnLoad = dialog.querySelector('h1, h2, h3, h4, h5');
  let firstFocusable;

  if (focusablesOnLoad.length && isElementInView(focusablesOnLoad[0])) {
    firstFocusable = focusablesOnLoad[0]; // eslint-disable-line prefer-destructuring
  } else if (titleOnLoad) {
    titleOnLoad.setAttribute('tabIndex', 0);
    firstFocusable = titleOnLoad;
  } else {
    firstFocusable = close;
  }

  dialog.addEventListener('keydown', (event) => {
    const isShiftKey = event.shiftKey;
    const isTab = event.key === 'Tab';
    const isCloseActive = document.activeElement === close;

    if (!isShiftKey && isTab && isCloseActive) {
      event.preventDefault();
      firstFocusable.focus(focusVisible);
    }

    if (isTab && isShiftKey && document.activeElement === firstFocusable) {
      event.preventDefault();
      close.focus(focusVisible);
    }
  });

  close.addEventListener('click', (e) => {
    closeModal(dialog);
    e.preventDefault();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal(dialog);
    }
  });

  dialog.append(close);
  document.body.append(dialog);
  firstFocusable.focus({ preventScroll: true, ...focusVisible });
  window.dispatchEvent(loadedEvent);

  if (!dialog.classList.contains('curtain-off')) {
    document.body.classList.add('disable-scroll');
    const curtain = createTag$1('div', { class: 'modal-curtain is-open' });
    curtain.addEventListener('click', (e) => {
      if (e.target === curtain) closeModal(dialog);
    });
    dialog.insertAdjacentElement('afterend', curtain);
    [...document.querySelectorAll('header, main, footer')]
      .forEach((element) => element.setAttribute('aria-disabled', 'true'));
  }

  const iframe = dialog.querySelector('iframe');
  if (iframe) {
    if (dialog.classList.contains('commerce-frame')) {
      const { default: enableCommerceFrameFeatures } = await Promise.resolve().then(() => modal_merch);
      await enableCommerceFrameFeatures({ dialog, iframe });
    } else {
      /* Initially iframe height is set to 0% in CSS for the height auto adjustment feature.
      For modals without the 'commerce-frame' class height auto adjustment is not applicable */
      iframe.style.height = '100%';
    }
  }

  return dialog;
}

// Click-based modal
window.addEventListener('hashchange', (e) => {
  if (!window.location.hash) {
    try {
      const url = new URL(e.oldURL);
      const dialog = document.querySelector(`.dialog-modal${url.hash}`);
      if (dialog) closeModal(dialog);
    } catch (error) {
      /* do nothing */
    }
  } else {
    const details = findDetails(window.location.hash, null);
    if (details) getModal(details);
  }
});

const modal = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  closeModal,
  findDetails,
  getModal,
  sendAnalytics
}, Symbol.toStringTag, { value: 'Module' }));

function titleAppend(appendage) {
  if (!appendage) return;
  document.title = `${document.title} ${appendage}`;
  const ogTitleEl = document.querySelector('meta[property="og:title"]');
  if (ogTitleEl) ogTitleEl.setAttribute('content', document.title);
  const twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitleEl) twitterTitleEl.setAttribute('content', document.title);
}

const titleAppend$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: titleAppend
}, Symbol.toStringTag, { value: 'Module' }));

const SEOTECH_API_URL_PROD = 'https://14257-seotech.adobeioruntime.net';
const SEOTECH_API_URL_STAGE = 'https://14257-seotech-stage.adobeioruntime.net';

function logError(msg) {
  window.lana?.log(`SEOTECH: ${msg}`, {
    debug: false,
    implicitSampleRate: 100,
    sampleRate: 100,
    tags: 'errorType=seotech',
  });
}

async function getVideoObject(url, seotechAPIUrl) {
  const videoUrl = new URL(url)?.href;
  const videoObjectUrl = `${seotechAPIUrl}/api/v1/web/seotech/getVideoObject?url=${videoUrl}`;
  const resp = await fetch(videoObjectUrl, { headers: { 'Content-Type': 'application/json' } });
  const body = await resp?.json();
  if (!resp.ok) {
    throw new Error(`Failed to fetch video: ${body?.error}`);
  }
  return body.videoObject;
}

async function getStructuredData(url, sheetUrl, seotechAPIUrl) {
  const apiUrl = new URL(seotechAPIUrl);
  apiUrl.pathname = '/api/v1/web/seotech/getStructuredData';
  apiUrl.searchParams.set('url', url);
  if (sheetUrl) {
    apiUrl.searchParams.set('sheetUrl', sheetUrl);
  }
  const resp = await fetch(apiUrl.href, { headers: { 'Content-Type': 'application/json' } });
  const body = await resp?.json();
  if (!resp.ok) {
    throw new Error(`Failed to fetch structured data: ${body?.error}`);
  }
  return body.objects;
}

async function appendScriptTag({ locationUrl, getMetadata, createTag, getConfig }) {
  const windowUrl = new URL(locationUrl);
  const seotechAPIUrl = getConfig()?.env?.name === 'prod'
    ? SEOTECH_API_URL_PROD : SEOTECH_API_URL_STAGE;

  const append = (obj) => {
    const script = createTag('script', { type: 'application/ld+json' }, JSON.stringify(obj));
    document.head.append(script);
  };

  const promises = [];
  if (getMetadata('seotech-structured-data') === 'on') {
    const pageUrl = `${windowUrl.origin}${windowUrl.pathname}`;
    const sheetUrl = (new URLSearchParams(windowUrl.search)).get('seotech-sheet-url') || getMetadata('seotech-sheet-url');
    promises.push(getStructuredData(pageUrl, sheetUrl, seotechAPIUrl)
      .then((objects) => objects.forEach((obj) => append(obj)))
      .catch((e) => logError(e.message)));
  }
  if (getMetadata('seotech-video-url')) {
    promises.push(getVideoObject(getMetadata('seotech-video-url'), seotechAPIUrl)
      .then((videoObject) => append(videoObject))
      .catch((e) => logError(e.message)));
  }
  return Promise.all(promises);
}

const seotech = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  SEOTECH_API_URL_PROD,
  SEOTECH_API_URL_STAGE,
  appendScriptTag,
  default: appendScriptTag,
  getStructuredData,
  getVideoObject,
  logError
}, Symbol.toStringTag, { value: 'Module' }));

function getRichResultsForArticle(type, getMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    headLine: getMetadata('og:title'),
    image: getMetadata('og:image'),
    datePublished: getMetadata('published'),
    dateModified: getMetadata('modified'),
    author: {
      '@type': 'Person',
      name: getMetadata('authorname'),
      url: getMetadata('authorurl'),
    },
  };
}

function getRichResultsForSiteSearchBox(getMetadata) {
  // See specifications at https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
  const SEARCH_TERM_STRING = 'search_term_string';
  const urlTemplate = `${getMetadata('search-url')}?${getMetadata('search-parameter-name')}={${SEARCH_TERM_STRING}}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: getMetadata('url'),
    potentialAction: [{
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate,
      },
      'query-input': `required name=${SEARCH_TERM_STRING}`,
    }],
  };
}

function getRichResultsForOrgLogo(getMetadata) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    url: getMetadata('orgurl'),
    logo: getMetadata('orglogo'),
  };
}

function getRichResults(type, getMetadata) {
  switch (type) {
    case 'Article':
    case 'NewsArticle':
      return getRichResultsForArticle(type, getMetadata);
    case 'SiteSearchBox':
      return getRichResultsForSiteSearchBox(getMetadata);
    case 'Organization':
      return getRichResultsForOrgLogo(getMetadata);
    default:
      // eslint-disable-next-line no-console
      console.error(`Type ${type} is not supported`);
      return null;
  }
}

function addToDom(richResults, createTag) {
  if (!richResults) {
    return;
  }
  const script = createTag('script', { type: 'application/ld+json' }, JSON.stringify(richResults));
  document.head.append(script);
}

// createTag and getMetadata are passed in to avoid circular dependencies
function addRichResults(type, { createTag, getMetadata }) {
  const richResults = getRichResults(type, getMetadata);
  addToDom(richResults, createTag);
}

const richresults = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: addRichResults
}, Symbol.toStringTag, { value: 'Module' }));

function loadFavicon(createTag, config, getMetadata) {
  const { codeRoot } = config;
  const name = getMetadata('favicon') || 'favicon';
  const favBase = `${codeRoot}/img/favicons/${name}`;

  const favicon = document.head.querySelector('link[rel="icon"]');
  const tags = `<link rel="apple-touch-icon" href="${favBase}-180.png">
                <link rel="manifest" href="${favBase}.webmanifest">`;
  favicon.insertAdjacentHTML('afterend', tags);
  favicon.href = `${favBase}.ico`;
}

const favicon = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: loadFavicon
}, Symbol.toStringTag, { value: 'Module' }));

/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const loadJarvisChat = async (getConfig, getMetadata, loadScript, loadStyle) => {
  const config = getConfig();
  const jarvis = getMetadata('jarvis-chat')?.toLowerCase();
  if (!jarvis || !['mobile', 'desktop', 'on'].includes(jarvis)
    || !config.jarvis?.id || !config.jarvis?.version) return;

  const desktopViewport = window.matchMedia('(min-width: 900px)').matches;
  if (jarvis === 'mobile' && desktopViewport) return;
  if (jarvis === 'desktop' && !desktopViewport) return;

  const { initJarvisChat } = await Promise.resolve().then(() => jarvisChat);
  initJarvisChat(config, loadScript, loadStyle, getMetadata);
};

const loadPrivacy = async (getConfig, loadScript) => {
  const acom = '7a5eb705-95ed-4cc4-a11d-0cc5760e93db';
  const ids = {
    'hlx.page': '3a6a37fe-9e07-4aa9-8640-8f358a623271-test',
    'hlx.live': '926b16ce-cc88-4c6a-af45-21749f3167f3-test',
  };

  const otDomainId = ids?.[Object.keys(ids)
    .find((domainId) => window.location.host.includes(domainId))]
      ?? (getConfig()?.privacyId || acom);
  window.fedsConfig = {
    privacy: { otDomainId },
    documentLanguage: true,
  };
  loadScript('https://www.adobe.com/etc.clientlibs/globalnav/clientlibs/base/privacy-standalone.js');

  // Privacy triggers can exist anywhere on the page and can be added at any time
  document.addEventListener('click', (event) => {
    if (event.target.closest('a[href*="#openPrivacy"]')) {
      event.preventDefault();
      window.adobePrivacy?.showPreferenceCenter();
    }
  });
};

const loadGoogleLogin = async (getMetadata, loadIms, loadScript) => {
  const googleLogin$1 = getMetadata('google-login')?.toLowerCase();
  if (window.adobeIMS?.isSignedInUser() || !['mobile', 'desktop', 'on'].includes(googleLogin$1)) return;
  const desktopViewport = window.matchMedia('(min-width: 900px)').matches;
  if (googleLogin$1 === 'mobile' && desktopViewport) return;
  if (googleLogin$1 === 'desktop' && !desktopViewport) return;

  const { default: initGoogleLogin } = await Promise.resolve().then(() => googleLogin);
  initGoogleLogin(loadIms, getMetadata, loadScript);
};

/**
 * Executes everything that happens a lot later, without impacting the user experience.
 */
const loadDelayed = ([
  getConfig,
  getMetadata,
  loadScript,
  loadStyle,
  loadIms,
], DELAY = 3000) => new Promise((resolve) => {
  setTimeout(() => {
    loadPrivacy(getConfig, loadScript);
    loadJarvisChat(getConfig, getMetadata, loadScript, loadStyle);
    loadGoogleLogin(getMetadata, loadIms, loadScript);
    if (getMetadata('interlinks') === 'on') {
      const { locale } = getConfig();
      const path = `${locale.contentRoot}/keywords.json`;
      const language = locale.ietf?.split('-')[0];
      Promise.resolve().then(() => interlinks).then((mod) => { mod.default(path, language); resolve(mod); });
    } else {
      resolve(null);
    }
    Promise.resolve().then(() => samplerum).then(({ sampleRUM }) => sampleRUM('cwv'));
  }, DELAY);
});

const delayed = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: loadDelayed,
  loadGoogleLogin,
  loadJarvisChat,
  loadPrivacy
}, Symbol.toStringTag, { value: 'Module' }));

/* eslint-disable max-classes-per-file */

const fragMap = {};

const removeHash = (url) => {
  const urlNoHash = url.split('#')[0];
  return url.includes('#_dnt') ? `${urlNoHash}#_dnt` : urlNoHash;
};

const isCircularRef = (href) => [...Object.values(fragMap)]
  .some((tree) => {
    const node = tree.find(href);
    return node ? !(node.isLeaf) : false;
  });

const updateFragMap = (fragment, a, href) => {
  const fragLinks = [...fragment.querySelectorAll('a')]
    .filter((link) => localizeLink(link.href).includes('/fragments/'));
  if (!fragLinks.length) return;

  if (document.body.contains(a)) { // is fragment on page (not nested)
    // eslint-disable-next-line no-use-before-define
    fragMap[href] = new Tree(href);
    fragLinks.forEach((link) => fragMap[href].insert(href, localizeLink(removeHash(link.href))));
  } else {
    Object.values(fragMap).forEach((tree) => {
      if (tree.find(href)) {
        fragLinks.forEach((link) => tree.insert(href, localizeLink(removeHash(link.href))));
      }
    });
  }
};

const setManifestIdOnChildren = (sections, manifestId) => {
  [...sections[0].children].forEach(
    (child) => (child.dataset.manifestId = manifestId),
  );
};

const insertInlineFrag = (sections, a, relHref) => {
  // Inline fragments only support one section, other sections are ignored
  const fragChildren = [...sections[0].children];
  fragChildren.forEach((child) => child.setAttribute('data-path', relHref));
  if (a.parentElement.nodeName === 'DIV' && !a.parentElement.attributes.length) {
    a.parentElement.replaceWith(...fragChildren);
  } else {
    a.replaceWith(...fragChildren);
  }
};

function replaceDotMedia(path, doc) {
  const resetAttributeBase = (tag, attr) => {
    doc.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((el) => {
      el[attr] = new URL(el.getAttribute(attr), new URL(path, window.location)).href;
    });
  };
  resetAttributeBase('img', 'src');
  resetAttributeBase('source', 'srcset');
}

async function init$2(a) {
  const { decorateArea, mep } = getConfig$1();
  let relHref = localizeLink(a.href);
  let inline = false;

  if (a.parentElement?.nodeName === 'P') {
    const children = a.parentElement.childNodes;
    const div = createTag$1('div');
    for (const attr of a.parentElement.attributes) div.setAttribute(attr.name, attr.value);
    a.parentElement.replaceWith(div);
    div.append(...children);
  }

  if (a.href.includes('#_inline')) {
    inline = true;
    a.href = a.href.replace('#_inline', '');
    relHref = relHref.replace('#_inline', '');
  }

  const path = new URL(a.href).pathname;
  if (mep?.fragments?.[path] && mep) {
    relHref = mep.handleFragmentCommand(mep?.fragments[path], a);
    if (!relHref) return;
  }

  if (isCircularRef(relHref)) {
    window.lana?.log(`ERROR: Fragment Circular Reference loading ${a.href}`);
    return;
  }

  const { customFetch } = await Promise.resolve().then(() => helpers);
  const resp = await customFetch({ resource: `${a.href}.plain.html`, withCacheRules: true })
    .catch(() => ({}));

  if (!resp?.ok) {
    window.lana?.log(`Could not get fragment: ${a.href}.plain.html`);
    return;
  }

  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  replaceDotMedia(a.href, doc);
  if (decorateArea) decorateArea(doc, { fragmentLink: a });

  const sections = doc.querySelectorAll('body > div');

  if (!sections.length) {
    window.lana?.log(`Could not make fragment: ${a.href}.plain.html`);
    return;
  }

  const fragment = createTag$1('div', { class: 'fragment', 'data-path': relHref });

  if (!inline) {
    fragment.append(...sections);
  }

  updateFragMap(fragment, a, relHref);

  if (a.dataset.manifestId) {
    if (inline) {
      setManifestIdOnChildren(sections, a.dataset.manifestId);
    } else {
      fragment.dataset.manifestId = a.dataset.manifestId;
    }
  }

  if (inline) {
    insertInlineFrag(sections, a, relHref);
  } else {
    a.parentElement.replaceChild(fragment, a);
    await loadArea(fragment);
  }
}

let Node$1 = class Node {
  constructor(key, value = key, parent = null) {
    this.key = key;
    this.value = value;
    this.parent = parent;
    this.children = [];
  }

  get isLeaf() {
    return this.children.length === 0;
  }
};

class Tree {
  constructor(key, value = key) {
    this.root = new Node$1(key, value);
  }

  * traverse(node = this.root) {
    yield node;
    if (node.children.length) {
      for (const child of node.children) {
        yield* this.traverse(child);
      }
    }
  }

  insert(parentNodeKey, key, value = key) {
    for (const node of this.traverse()) {
      if (node.key === parentNodeKey) {
        node.children.push(new Node$1(key, value, node));
        return true;
      }
    }
    return false;
  }

  remove(key) {
    for (const node of this.traverse()) {
      const filtered = node.children.filter((c) => c.key !== key);
      if (filtered.length !== node.children.length) {
        node.children = filtered;
        return true;
      }
    }
    return false;
  }

  find(key) {
    for (const node of this.traverse()) {
      if (node.key === key) return node;
    }
    return undefined;
  }
}

const fragment = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  Tree,
  default: init$2
}, Symbol.toStringTag, { value: 'Module' }));

(function () {
  const MSG_LIMIT = 2000;

  const defaultOptions = {
    clientId: '',
    endpoint: 'https://www.adobe.com/lana/ll',
    endpointStage: 'https://www.stage.adobe.com/lana/ll',
    errorType: 'e',
    sampleRate: 1,
    tags: '',
    implicitSampleRate: 1,
    useProd: true,
  };

  const w = window;

  function isProd() {
    const { host } = window.location;
    if (host.substring(host.length - 10) === '.adobe.com'
      && host.substring(host.length - 15) !== '.corp.adobe.com'
      && host.substring(host.length - 16) !== '.stage.adobe.com') {
      return true;
    }
    return false;
  }

  function mergeOptions(op1, op2) {
    if (!op1) {
      op1 = {};
    }

    if (!op2) {
      op2 = {};
    }

    function getOpt(key) {
      if (op1[key] !== undefined) {
        return op1[key];
      }
      if (op2[key] !== undefined) {
        return op2[key];
      }
      return defaultOptions[key];
    }

    return Object.keys(defaultOptions).reduce((options, key) => {
      options[key] = getOpt(key);
      return options;
    }, {});
  }

  function sendUnhandledError(e) {
    log(e.reason || e.error || e.message, { errorType: 'i' });
  }

  function log(msg, options) {
    msg = msg && msg.stack ? msg.stack : (msg || '');
    if (msg.length > MSG_LIMIT) {
      msg = `${msg.slice(0, MSG_LIMIT)}<trunc>`;
    }

    const o = mergeOptions(options, w.lana.options);
    if (!o.clientId) {
      console.warn('LANA ClientID is not set in options.');
      return;
    }

    const sampleRate = o.errorType === 'i' ? o.implicitSampleRate : o.sampleRate;

    if (!w.lana.debug && !w.lana.localhost && sampleRate <= Math.random() * 100) return;

    const isProdDomain = isProd();

    const endpoint = (!isProdDomain || !o.useProd) ? o.endpointStage : o.endpoint;
    const queryParams = [
      `m=${encodeURIComponent(msg)}`,
      `c=${encodeURI(o.clientId)}`,
      `s=${sampleRate}`,
      `t=${encodeURI(o.errorType)}`,
    ];

    if (o.tags) {
      queryParams.push(`tags=${encodeURI(o.tags)}`);
    }

    if (!isProdDomain || w.lana.debug || w.lana.localhost) console.log('LANA Msg: ', msg, '\nOpts:', o);

    if (!w.lana.localhost || w.lana.debug) {
      const xhr = new XMLHttpRequest();
      if (w.lana.debug) {
        queryParams.push('d');
        xhr.addEventListener('load', () => {
          console.log('LANA response:', xhr.responseText);
        });
      }
      xhr.open('GET', `${endpoint}?${queryParams.join('&')}`);
      xhr.send();
      return xhr;
    }
  }

  function hasDebugParam() {
    return w.location.search.toLowerCase().indexOf('lanadebug') !== -1;
  }

  function isLocalhost() {
    return w.location.host.toLowerCase().indexOf('localhost') !== -1;
  }

  w.lana = {
    debug: false,
    log,
    options: mergeOptions(w.lana && w.lana.options),
  };

  /* c8 ignore next */
  if (hasDebugParam()) w.lana.debug = true;
  if (isLocalhost()) w.lana.localhost = true;

  w.addEventListener('error', sendUnhandledError);
  w.addEventListener('unhandledrejection', sendUnhandledError);
}());

const lana = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

async function customFetch({ resource, withCacheRules }) {
  const options = {};
  if (withCacheRules) {
    const params = new URLSearchParams(window.location.search);
    options.cache = params.get('cache') === 'off' ? 'reload' : 'default';
  }
  return fetch(resource, options);
}

const helpers = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  customFetch
}, Symbol.toStringTag, { value: 'Module' }));

const getMetadata$2 = (el, config) => [...el.childNodes].reduce((rdx, row) => {
  if (row.children?.length > 1) {
    const key = processTrackingLabels(row.children[0].textContent, config);
    const value = processTrackingLabels(row.children[1].textContent, config);
    if (key && value) rdx[key] = value;
  }
  return rdx;
}, {});

function init$1(el) {
  const config = getConfig$1();
  const { locale, ietf = locale?.ietf, analyticLocalization } = config;
  if (ietf !== 'en-US') {
    config.analyticLocalization = {
      ...analyticLocalization,
      ...getMetadata$2(el, config),
    };
  }
  el.remove();
  return config;
}

const martechMetadata = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: init$1,
  getMetadata: getMetadata$2
}, Symbol.toStringTag, { value: 'Module' }));

const CONFIG = {
  selectors: { prompt: '.appPrompt' },
  delay: 7000,
  loaderColor: '#EB1000',
};

const getElemText = (elem) => elem?.textContent?.trim().toLowerCase();

const getMetadata$1 = (el) => [...el.childNodes].reduce((acc, row) => {
  if (row.children?.length === 2) {
    const key = getElemText(row.children[0]);
    const val = getElemText(row.children[1]);
    if (key && val) acc[key] = val;
  }
  return acc;
}, {});

const getIcon = (content) => {
  const picture = content.querySelector('picture');
  if (picture) return picture;

  const svg = content.querySelector('a[href$=".svg"]');
  if (svg) return decorateSVG(svg);

  return icons$1.company;
};

class AppPrompt {
  constructor({ promptPath, entName, parent, getAnchorState } = {}) {
    this.promptPath = promptPath;
    this.entName = entName;
    this.parent = parent;
    this.getAnchorState = getAnchorState;
    this.id = this.promptPath.split('/').pop();
    this.elements = {};

    this.init();
  }

  init = async () => {
    if (this.isDismissedPrompt() || !this.parent) return;

    const entMatch = await this.doesEntitlementMatch();
    if (!entMatch) return;

    const content = await this.fetchContent();
    if (!content) return;

    await this.getData(content);
    if (!this.options['redirect-url'] || !this.options['product-name']) return;

    ({ id: this.anchorId, isOpen: this.isAnchorExpanded } = await this.getAnchorState()
      .catch((e) => {
        lanaLog({
          message: 'Error on getting anchor state',
          e,
          tags: 'errorType=error,module=pep',
        });
        return {};
      }));
    if (this.isAnchorExpanded) return;

    if (this.anchorId) this.anchor = document.querySelector(`#${this.anchorId}`);
    this.offset = this.anchor
      ? this.parent.offsetWidth - (this.anchor.offsetWidth + this.anchor.offsetLeft) : 0;
    this.template = this.decorate();

    this.addEventListeners();

    this.parent.prepend(this.template);
    this.elements.closeIcon.focus();

    this.redirectFn = this.initRedirect();
  };

  doesEntitlementMatch = async () => {
    const entitlements = await getConfig$1().entitlements();
    return entitlements?.length && entitlements.includes(this.entName);
  };

  fetchContent = async () => {
    const res = await fetch(`${this.promptPath}.plain.html`);

    if (!res.ok) {
      lanaLog({
        message: `Error fetching content for prompt: ${this.promptPath}.plain.html`,
        e: `Status ${res.status} when trying to fetch content for prompt`,
        tags: 'errorType=error,module=pep',
      });
      return '';
    }

    const text = await res.text();
    const content = await replaceText(text, getFedsPlaceholderConfig());
    const html = new DOMParser().parseFromString(content, 'text/html');

    return html;
  };

  getData = async (content) => {
    this.icon = getIcon(content);

    const selectors = {
      title: 'h2',
      subtitle: 'h3',
      cancel: 'em > a',
    };

    await Promise.all(Object.keys(selectors).map(async (key) => {
      const element = content.querySelector(selectors[key]);
      if (element?.innerText) this[key] = element.innerText;
      else {
        const label = await replaceKey(`pep-prompt-${key}`, getFedsPlaceholderConfig());
        this[key] = label === `pep prompt ${key}` ? '' : label;
      }
    }));

    await getUserProfile()
      .then((data) => {
        const requiredFields = ['display_name', 'email', 'avatar'];
        const hasRequiredFields = requiredFields.every((field) => !!data[field]);
        if (!hasRequiredFields) return;

        this.profile = data;
      }).catch((e) => {
        lanaLog({
          message: 'Error fetching user profile',
          e,
          tags: 'errorType=error,module=pep',
        });
      });

    const metadata = getMetadata$1(content.querySelector('.section-metadata'));
    metadata['loader-duration'] = parseInt(metadata['loader-duration'] || CONFIG.delay, 10);
    metadata['loader-color'] = metadata['loader-color'] || CONFIG.loaderColor;
    this.options = metadata;
  };

  decorate = () => {
    this.elements.closeIcon = toFragment`<button daa-ll="Close Modal" aria-label="${this.cancel}" class="appPrompt-close"></button>`;
    this.elements.cta = toFragment`<button daa-ll="Stay on this page" class="appPrompt-cta appPrompt-cta--close">${this.cancel}</button>`;
    this.elements.profile = this.profile
      ? toFragment`<div class="appPrompt-profile">
        <div class="appPrompt-avatar">
          <img class="appPrompt-avatar-image" src="${this.profile.avatar}" />
        </div>
        <div class="appPrompt-user">
          <div class="appPrompt-name">${this.profile.display_name}</div>
          <div class="appPrompt-email">${this.profile.email}</div>
        </div>
      </div>`
      : '';

    return toFragment`<div
      daa-state="true" daa-im="true" daa-lh="PEP Modal_${this.options['product-name']}"
      class="appPrompt" style="margin: 0 ${this.offset}px">
      ${this.elements.closeIcon}
      <div class="appPrompt-icon">
        ${this.icon}
      </div>
      <div class="appPrompt-title">${this.title}</div>
      ${this.elements.profile}
      <div class="appPrompt-footer">
        <div class="appPrompt-text">${this.subtitle}</div>
        ${this.elements.cta}
      </div>
      <div class="appPrompt-progressWrapper">
        <div class="appPrompt-progress" style="background-color: ${this.options['loader-color']}; animation-duration: ${this.options['loader-duration']}ms;"></div>
      </div>
    </div>`;
  };

  addEventListeners = () => {
    this.anchor?.addEventListener('click', this.close);
    document.addEventListener('keydown', this.handleKeyDown);

    [this.elements.closeIcon, this.elements.cta]
      .forEach((elem) => elem.addEventListener('click', this.close));
  };

  handleKeyDown = (event) => {
    if (event.key === 'Escape') this.close();
  };

  initRedirect = () => setTimeout(() => {
    this.close({ saveDismissal: false });
    window.location.assign(this.options['redirect-url']);
  }, this.options['loader-duration']);

  isDismissedPrompt = () => AppPrompt.getDismissedPrompts().includes(this.id);

  setDismissedPrompt = () => {
    const dismissedPrompts = new Set(AppPrompt.getDismissedPrompts());
    dismissedPrompts.add(this.id);
    document.cookie = `dismissedAppPrompts=${JSON.stringify([...dismissedPrompts])};path=/`;
  };

  close = ({ saveDismissal = true } = {}) => {
    const appPromptElem = document.querySelector(CONFIG.selectors.prompt);
    appPromptElem?.remove();
    clearTimeout(this.redirectFn);
    if (saveDismissal) this.setDismissedPrompt();
    document.removeEventListener('keydown', this.handleKeyDown);
    this.anchor?.focus();
    this.anchor?.removeEventListener('click', this.close);
  };

  static getDismissedPrompts = () => {
    const cookie = document.cookie
      .split(';')
      .find((item) => item.trim().startsWith('dismissedAppPrompts='))
      ?.split('=')[1];

    return cookie ? JSON.parse(cookie) : [];
  };
}

async function init(config) {
  try {
    const appPrompt = await new AppPrompt(config);
    return appPrompt;
  } catch (e) {
    lanaLog({ message: 'Could not initialize PEP', e, tags: 'errorType=error,module=pep' });
    return null;
  }
}

const webappPrompt = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: init
}, Symbol.toStringTag, { value: 'Module' }));

async function decorateAside({ headerElem, promoPath } = {}) {
  const onError = () => {
    headerElem?.classList.remove('has-promo');
    lanaLog({ message: 'Gnav Promo fragment not replaced, potential CLS' });
    return '';
  };

  const fragLink = toFragment`<a href="${promoPath}">${promoPath}</a>`;
  const fragTemplate = toFragment`<div>${fragLink}</div>`;
  decorateAutoBlock(fragLink);
  if (!fragLink.classList.contains('fragment')) return onError();
  await loadBlock$2(fragLink).catch(() => onError());
  const aside = fragTemplate.querySelector('.aside');
  if (fragTemplate.contains(fragLink) || !aside) return onError();

  aside.removeAttribute('data-block');
  aside.setAttribute('daa-lh', 'Promo');

  aside.querySelectorAll('a').forEach((link, index) => {
    link.setAttribute('daa-ll', `${processTrackingLabels(link.textContent)}--${index + 1}`);
  });

  return aside;
}

const aside = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: decorateAside
}, Symbol.toStringTag, { value: 'Module' }));

const STAGE_ENTITLEMENTS = {
  '5a5fd14e-f4ca-49d2-9f87-835df5477e3c': 'photoshop-any',
  '09bc4ba3-ebed-4d05-812d-a1fb1a7e82ae': 'indesign-any',
  '25ede755-7181-4be2-801e-19f157c005ae': 'illustrator-any',
  'bf632803-4412-463d-83c5-757dda3224ee': 'cc-all-apps-any',
  '73c3406b-32a2-4465-abf3-2d415b9b1f4f': 'after-effects-any',
  '07609803-48a0-4762-be51-94051ccffb45': 'premiere-pro-any',
  '67129b31-eb1a-4c9e-b251-4561ac7c8602': 'any-cc-product-no-stock',
  '569f0f9d-83e8-45b4-adbf-07ef08a83398': 'any-cc-product-with-stock',
  '47e204a3-220a-4e53-a95e-94b6eded0d26': '3d-substance-collection',
  '4ec7b469-42c9-4367-a7da-39f11a32d880': '3d-substance-texturing',
  // PEP segments
  '9202b767-77dc-4e6e-8d74-488d9ef08900': 'lightroom-web-usage',
  '3a7ffcce-11b8-4242-8cdf-8c8d059ae1cd': 'photoshop-signup-source',
  '81541746-1564-46d5-8787-02c3cd4bf548': 'photoshop-web-usage',
  'cbe1d7ab-db7d-49cb-969e-a6a2bbe8c660': 'firefly-signup-source',
  '49033b54-1c02-4640-840d-3c5fd6174992': 'firefly-web-usage',
  '96adf81f-97ca-4943-81ff-c41fbe8f3af7': 'acrobat-web-usage',
};

const stageEntitlements = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: STAGE_ENTITLEMENTS
}, Symbol.toStringTag, { value: 'Module' }));

function getMobileBg() {
  return `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 648 858">
  <defs>
    <style>
      .cls-1 {
        fill: #f4f4f4;
        stroke-width: 0px;
      }
    </style>
  </defs>
  <path class="cls-1" d="M.09,118.06c9.75-.75,19.3-2.76,28.89-4.49,4.38-.79,8.66-1.81,12.93.55,3.66,2.02,7.84.67,11.78,1.47,4.22.86,8.46,1.49,12.52,3.01,1.49.56,3.34.9,4.06-.62,1.17-2.48,2.28-5.25,2.32-7.91.02-1.65-2.11-.62-3.26-.12-3.85,1.67-7.77,1.61-11.65.31-1.56-.52-3.24-1.45-3.21-3.39.02-1.6,1.37-2.27,2.77-3.09,4.7-2.76,9.59-5.36,14.47-7.52,10.56-4.67,21-2.24,30.56,3.65,5.05,3.11,16.99,2.73,21.36-1.24.44-.4.96-1.08.92-1.58-.09-1.1-1.18-1.13-1.94-.99-9.86,1.82-18.86-2.08-28.12-4.18-1.9-.43-4.28-.95-4.18-3.5.1-2.52,2.42-2.17,4.2-2.45,7.99-1.27,15.75-3.84,23.95-3.97,2.94-.05,5.16.49,6.51,3.37,1.02,2.16,2.82,3.48,5.25,2.41,2.76-1.21,1.7-3.03.46-4.85-.89-1.3.17-2.2,1.05-2.94,4.06-3.44,8.93-3.15,13.77-2.77.48.04,1.23.74,1.3,1.22.23,1.54-.83,2.71-2.04,3.1-5.63,1.8-3.59,4.19-.82,6.98,1.16,1.17,3.66,2.1,2.46,4.3-1,1.83-3.17,2.2-5.26,2.25-3.55.08-7.67-.86-6.64,5.43.3,1.83-2.96,2.85-4.45,4.33-1.68,1.66-5.6,3.14-3.11,6.2,2.28,2.8,3.84,8.3,9.57,5.27,1.56-.83,3-.98,4.74-.43,2.05.65,3.62-.53,4.45-2.33,1.03-2.23-1.17-2.18-2.29-2.95-1.08-.75-2.08-1.69-2.94-2.69-1.25-1.45-3.64-2.39-3.13-4.75.58-2.73,3.09-1.93,4.97-2.11,1.27-.12,2.09-.91,2.99-1.66,1.94-1.62,4.17-2.68,6.63-3.31,1.58-.4,4.36,1.14,4.5-1.38.12-2.01-2.83-1.81-4.44-2.46-1.61-.65-3.91-1.55-3.39-3,.83-2.36,2.67-4.52,4.49-6.35,1.57-1.57,2.75.35,3.61,1.38,2.34,2.82,5.1.98,7.33.37,1.81-.49.64-1.75-.68-2.69-3.33-2.39-2.97-4.99.89-6.35,2.77-.98,5.56-1.42,8.69-.72,2.7.61,5.47,1.52,5.57,3.98.11,2.61-3.04,3.49-5.41,4.16-1.2.34-2.94-.17-2.78,1.91.12,1.59,1.57,2.02,2.75,2.6,1.41.69,2.22.41,3.15-1.13,1.72-2.84,4.46-4.76,5.83-8.21,1.46-3.69,7.97-2.13,10.63,2.26.88,1.45.65,4.77,3.77,2.62,2.68-1.84,1.01-3.98-.46-5.46-3.69-3.71-.99-6.04,1.96-7.2,5.49-2.15,11.09-4.8,17.34-2.75.6.2,1.4.38,1.93.16,12.81-5.4,26.7-3.13,39.92-5.7,11.37-2.22,22.91-.95,34.35-.9,9.24.03,18.22,3.85,27.6,2.84,16.79-1.8,33.69-1.9,50.5-3.73,18.32-1.99,36.81-2.89,54.89,1.96,7.96,2.14,15.94,2.6,24.03,2.81,1.6.04,3.77-.38,4.02,1.86.21,1.92-1.58,2.7-3.25,3.18-2.23.63-4.45,1.33-6.71,1.86-3.79.88-6.59,2.9-8.28,6.47-1.28,2.7-2.46,5.44-4.61,7.66-.76.78-1.69,2.32-1.4,3.06,2.32,5.9-2.3,6.57-5.82,8.18-2.27,1.04-4.45,2.27-6.71,3.34-2.99,1.42-4.68,3.75-4.69,7.05-.02,5.71-3.45,8.79-8.28,10.46-10.63,3.67-21.15,7.87-32.68,7.89-2.08,0-3.86,1.15-5.48,2.25-6.79,4.61-13.69,8.55-22.23,9.19-7.08.53-12.08,5.47-16.43,10.42-3.79,4.31-7.58,8.72-10.49,13.84-2.88,5.08-6.37,5.57-11.22,2.27-2.14-1.46-4.61-2.91-6.82-2.54-5.06.84-6.2-2.94-7.12-5.89-2.12-6.78-3.75-13.74-4.98-20.74-.8-4.56,1.46-8.33,5.2-11.09,2.39-1.76,5.93-3.32.87-6.21-1.88-1.08-.86-2.63-.1-3.9,3.4-5.66,1.5-12.28,3.28-18.35.69-2.36-2.87-5.31-6.62-5.3-6.16.02-12.33.01-18.49,0-6.97-.01-9.65-2.04-11.38-8.92-.44-1.75-1.35-2.5-2.75-1.59-4.71,3.03-10.41,2.71-15.45,4.92-6.36,2.79-10.9,8.15-17.19,10.9-1.35.59-1.9,1.47.12,2.73,6.96,4.35,13.33,9.56,21.12,12.67,2.94,1.17,5.4,4.17,3.68,8.2-.82,1.91-.21,3.15,1.52,4.12,2.03,1.13,4.01,2.35,5.97,3.6,4.81,3.06,4.95,4.87.73,8.6-5.85,5.17-8.16,5.44-15.33,1.68-.89-.47-1.8-1.29-2.67-.42-1.03,1.02.2,1.71.72,2.48,3.78,5.59,2.13,10.75-4.24,13.03-.78.28-1.91.25-1.96,1.19-.31,5.57-3.72,3.64-6.7,2.89-7.07-1.79-13.82-3.46-18.58-10.24-3.82-5.44-12.6-3.62-15.43,2.27-.47.98-.61,1.91.08,2.79.72.93,1.59.78,2.67.49,4.64-1.26,15.45,3.42,17.38,7.46.87,1.83-.28,3.16-1.29,4.5-1.39,1.85-1.35,3.69.15,5.44,1.43,1.67,3.26,1.35,5.07.85,3.85-1.06,6.27-4.28,9.46-6.35,3.22-2.09,5.09-1.69,6.24,2.15,1.51,5.08,3.45,10.05,2.7,15.52-.44,3.25,1.14,5.37,3.87,6.87,12.47,6.81,11.24,12.8,6.19,22.79-1.56,3.09-2.34,4.32,1.71,6.01,5.84,2.43,6.53,14.63.93,17.17-4.09,1.85-9.06.67-13.41-.77-3.23-1.07-5.92-3.19-9.71-3.31-3.14-.1-3.36-2.88-1.42-5.1,2.51-2.87,5.3-5.49,7.95-8.24.9-.94,2.39-1.94,1.57-3.33-1.04-1.78-2.41-.16-3.39.36-4.32,2.32-8.81,3.6-13.75,2.97-1.76-.22-2.4.96-2.49,2.41-.3,5.05-3.17,3.16-5.45,1.9-2.31-1.28-4.23-3.28-6.58-4.42-1.58-.76-4.04-.77-4.63,1.49-.73,2.78,1.79,2.09,3.27,2.24,3.24.32,4.05,2.15,2.76,4.82-.99,2.05-3.7,4.68-1.87,6.11,2.51,1.96,5.94,3.68,9.67,2.85.97-.22,1.91-.63,2.88-.72,1.79-.18,3.41.21,3.78,2.33.29,1.69.32,3.48-1.56,4.33-8.92,4.02-17.82,8.08-26.83,11.91-2.59,1.1-3.98-1.37-5.06-3.09-1.35-2.14-2.37-2.75-4.67-1.11-1.85,1.32-4.14,2.21-6.36,2.79-5.57,1.45-8.56,4.71-8.42,10.62.05,2-1.11,2.96-3.1,3.14-14.61,1.34-22.69,11.7-30.62,22.25-.2.27-.58.54-.57.8.48,12.61-11.53,13.42-18.26,19.12-3.36,2.85-7.53,4.72-11.22,7.21-8.04,5.45-7.24,13.33-5.75,21.41.97,5.28,1.5,10.55-1.55,15.46-1.52,2.45-2.85,3.08-5.43.8-5.43-4.8-6.09-10.74-5.2-17.29.65-4.73-1.26-6.73-5.89-5.99-1.39.22-2.8.31-3.81-.6-3.16-2.84-6.75-2.58-10.64-2.3-3.04.22-5.11,1.09-6.26,3.9-1.02,2.49-2.46,3.9-5.37,2.49-.85-.41-2.12.02-2.92-.43-12.13-6.71-20.59,1.84-29.73,7.22-2.11,1.24-3.04,3.54-3.92,6.06-2.41,6.9-4.67,13.8-6.22,20.95-1.35,6.21-.03,11.99,2.89,17.31,3.12,5.71,7.78,7.24,13.84,5.45,1.41-.42,2.9-.62,4.36-.85,4.04-.62,7.42-2.15,8.21-6.65,1.56-8.93,12.31-10.46,18.92-8.07,3.66,1.32,2.14,5.01.53,6.66-5.08,5.16-6.07,12.06-8.72,18.25-.74,1.72-1.08,3.77.62,5.07,1.74,1.33,3.72,1.03,5.5-.38,4.82-3.8,8.22,1.24,12.21,2.23,2.79.69,4.29,3.23,4.27,6.58-.02,4.09-1.4,7.81-2.28,11.68-.99,4.34-2.1,8.76.91,12.85,4.95,6.73,5.56,6.71,13.48,3.42,3.07-1.28,6.35-1.98,9.79.56,4.85,3.59,7.85,2.62,10.79-2.79,2.49-4.59,5.69-8.17,11.05-9.23,2.19-.44,3.92-1.71,5.73-2.91,5.55-3.7,6.72-3.13,7.13,3.53.65-.3,1.31-.45,1.77-.84,5.11-4.36,5.73-4.3,9.9,1.05,3.58,4.58,15.39,6.45,19.98,3.16,3-2.15,8.58-1.53,11.23,1.19,7.36,7.57,14.71,15.15,22.11,22.67,1.6,1.63,3.71,2.08,5.98,1.99,13.7-.55,22.69,5.79,27.17,18.68.22.63.7,1.19.81,1.82,1.78,10.86,9.17,15.8,19.02,18.3,4.5,1.14,8.75,2.65,12.17,6.29,2.56,2.72,6.8,3.69,10.16,3.51,8.12-.43,14.03,3.41,19.58,8.27,3.22,2.82,7.16,4.04,10.89,5.64,2.55,1.1,3.92,3.05,4.09,5.18.62,7.89,1.64,15.82-4.2,22.75-4.14,4.92-7.63,10.4-11.1,15.83-2.08,3.26-2.19,7.15-2.34,10.97-.46,11.61-1.55,23.12-5.63,34.16-2.17,5.87-4.62,10.02-12.17,11.05-7.56,1.03-13.78,6.74-20.2,11.06-2.28,1.53-2.56,4.18-1.87,6.32,2.27,6.97-.72,12.71-3.44,18.71-3.76,8.28-8.36,16.11-13.09,23.82-2.29,3.73-5.84,7.06-11.28,4.84-1.2-.49-2.83-.74-3.75.42-1.07,1.34.23,2.46,1,3.5,5.12,6.8,2.06,16.36-7.6,18-1.79.3-3.56.72-5.34,1.1-3.11.67-5.07,2.1-4.63,5.78.51,4.23-1.6,6.2-5.87,5.95-1.12-.07-2.59-.25-2.83,1.31-.25,1.62.98,2.14,2.36,2.66,5.15,1.92,5.33,2.64,1.8,7.07-.88,1.1-1.53,2.18-1.4,3.6.29,3.22-.82,5.83-3.18,8.04-3.17,2.97-1.64,4.94,1.6,6.24,1.72.69,3.34,1.4,4.72,2.69,1.96,1.84,2.4,3.89,1.25,6.3-.71,1.49-1.45,2.96-2.12,4.47-4.2,9.43-2.51,15.93,5.94,22.1,3.88,2.83,7.98,5.39,12.77,6.47,1.17.26,2.46.39,2.54,1.87.06,1.24-1.44,1.22-2.01,1.93-4.84,6.04-9.63,5.6-16.16,1.78-6.27-3.66-14.06-4.28-20.45-8.45-4.15-2.7-7.72-5.89-10.56-9.73-3.52-4.76-6.42-9.99-9.43-15.11-.9-1.54-1.94-3.48-1.73-5.08.48-3.77,1.18-7.19-3.77-8.42-.46-.11-1.14-1.39-1.01-1.53,2.95-3.53.84-7.14-.52-10.08-5.05-10.89-1.13-23.57-7.55-34.26-3.11-5.17-1.24-11.46.01-17.08,1.36-6.11.63-11.93-1.23-17.61-1.57-4.83-2.36-9.63-2.11-14.68.83-16.8-2.53-33.41-2.18-50.24.19-9-6.29-14.71-13.5-18.89-4.88-2.83-9.66-5.75-14.24-9-2.03-1.44-3.83-3.27-4.71-5.71-4.73-12.99-13.18-24.05-18.95-36.51-.95-2.05-2.67-3.81-4.27-5.47-4.96-5.18-5.66-9.88-2.23-16.47.78-1.51,1.57-3.06.76-4.74-4.45-9.22.67-16.05,6.03-22.43,3.57-4.25,6.65-8.57,8.75-13.73,3.7-9.08.51-16.83-4.18-24.35-1.17-1.88-2.47-2.25-4.24-.09-5.65,6.91-6.23,6.68-13.72,2.11-4.98-3.04-9.11-7.09-13.9-10.31-1.46-.98-2.14-2.28-2.43-4.1-1.33-8.31-6.71-13.2-14.41-15.38-6.5-1.84-12.67-3.73-16.69-9.76-3.13-4.7-7.59-6.19-12.93-4.16-2.93,1.11-5.92.61-8.89.77V118.06ZM216.59,127.97c-2.66.3-5.16-.11-7.58.28-1.11.18-2.26,1.03-3.2-.16-1.22-1.54.24-2.38,1.04-3.36.75-.92,1.67-1.93.63-3.04-1.06-1.13-2.09-.15-3.08.46-1.7,1.04-3.25,1.69-4.43-.83-1.52-3.22-3.15-2.61-5.05-.09-4.19,5.55-8.92,10.47-15.54,13.31-2.99,1.28-4.67,3.39-1.14,6.25,1.71,1.38,2.43,3.12,1.18,5.28-1.39,2.39-3.35,1.45-5.26,1-2.72-.64-5.48-1.88-8.15.04-3.98,2.86-7.8,2.08-11.59-.37-4.8-3.09-9.35-1.63-13.49,1.2-2.08,1.42-4.12,2.66-6.5,3.53-8.19,2.98-15.51,7.48-22.17,13.08-1.3,1.1-1.65,2-1.33,4.11.93,6.11,3.36,9.84,10.01,10.04,1.13.03,2.3,1.27,3.31,2.13,4.23,3.58,8.62,6.39,14.59,6.36,4.41-.02,5.69,2.76,3.35,6.21-.97,1.43-1.37,2.62-.21,4.03,1.52,1.84,1.34,3.62-.1,5.42-.65.81-1.05,1.81-.13,2.66.81.76,1.88.61,2.82.21,3.61-1.53,6.28-3.97,6.46-8.1.2-4.8,2.56-7.48,6.99-9.15,4.66-1.77,9.05-4.15,12.37-8.16,1.42-1.71,2.4-3.33.98-5.33-2.78-3.93-.87-6.52,2.36-8.71,1.4-.95,3.21-1.76,3.17-3.56-.06-3.09,1.82-4.81,3.7-6.72,2.21-2.25,3.91-4.71,4.74-7.97,1.41-5.55,8.9-12.31,13.54-11.48,8.31,1.5,12.31-4.68,17.75-8.58ZM181.82,100.23c-4.54,1.64-8.43,3.49-12.83,4.23-4.95.84-6.71,9.01-3.13,12.67,1.84,1.88,3.9,3.6,6.05,5.11,3.2,2.26,5.46-.45,7.29-2.23,2.06-2.01-.16-3.49-1.73-4.72-4.77-3.72-4.76-6.46.18-10,1.7-1.22,3.6-2.16,4.17-5.06ZM192.68,97.63c-.04-1.04-.52-1.43-1.24-1.4-.71.03-1.2.51-1.23,1.23-.03.72.4,1.34,1.14,1.17.54-.13.97-.72,1.33-1.01ZM647.9,594.96c-6.25,2.84-7.8,5.97-8.15,12.06-.31,5.31,1.85,10.42.46,15.78-.78,3.02-2.12,4.89-4.93,6.28-4.25,2.09-7.71,4.71-7.53,10.51.15,4.71-2.03,9.1-5.49,12.44-4.44,4.29-8.29,9.04-11.94,14-7.03,9.57-16.02,15.3-28.39,13.87-3.67-.42-6.83,1.06-10.12,2.08-2.74.85-5.52,1.09-8.37.97-4.43-.2-7.94-3.15-7.36-7.49.96-7.2-1.97-13.12-5.38-18.73-6.67-10.97-10.39-22.59-10.9-35.48-.31-7.84-5.37-14.09-8.81-20.85-3.46-6.8-6.12-13.52-3.71-21.82,1.78-6.13,1.34-13.1,5.91-18.08,2.64-2.89,2.95-5.78,2.69-9.11-.1-1.28-.53-2.63-1.15-3.76-1.49-2.74-2.45-5.41-1.05-8.54.35-.79.14-2.02-.2-2.89-4-10.3-6.93-21.04-15.01-29.4-4.46-4.61-7.39-10.12-3.7-17.12,2.26-4.28,1.18-9.45,2.05-14.17.44-2.37-5.88-7.79-8.67-7.45-6.78.82-11.95-.72-14.69-7.71-.86-2.2-3.32-3.57-5.78-3.22-6.7.93-13.5,1.6-19.53,5.22-4.15,2.48-8.56,3.41-13.34,1.65-4.98-1.83-9.95-.72-14.41,1.39-6.03,2.85-10.96,2.1-15.88-2.24-4.46-3.93-9.27-7.45-13.96-11.11-3.73-2.91-5.55-6.88-6.62-11.35-1.01-4.23-3.77-7.41-7.79-8.36-5.66-1.34-6.81-5.32-7.1-9.95-.24-3.98.15-7.99-2.47-11.45-1.12-1.49-.33-3.04.57-4.15,6.93-8.47,6.12-18.54,3.26-27.47-2.23-6.93.39-11.44,3.24-16.08,4.52-7.35,8.79-14.86,13.35-22.19,1.68-2.7,3.96-4.86,6.79-6.46,6-3.4,11.06-6.99,11.8-15.16.63-7.01,5.65-12.18,12.06-15.42,3.8-1.92,5.58-5.21,6.23-9.06.87-5.16-.79-7.07-6.06-6.85-4.16.17-5.15-1.26-6.13-5.48-2.21-9.54,4.08-17.85,2.6-27.24-.61-3.9,3.76-6.09,8.18-5.7,6.6.58,13.21,1.08,19.83,1.29,4.64.15,8.03-4.42,7.12-9.03-.92-4.64-3.23-8.27-7.56-10.47-1.03-.52-1.93-1.3-2.95-1.85-2.02-1.07-4.07-2.6-3.45-4.9.61-2.26,3.18-2.65,5.42-2.67,2.2-.02,4.15.06,5.27-2.63.92-2.22,3.51-2.18,5.63-2.35,1.82-.14,3.67.02,5.49-.12,1.64-.13,3.2-1.14,3.13-2.68-.09-1.85-2.06-1.2-3.26-1.2-5.95,0-11.98-.75-17.59,2.19-1.62.85-3.71,1.62-5.07,0-1.26-1.5.64-2.6,1.45-3.77.35-.51.85-1.39.65-1.75-3.08-5.52,1.14-8.75,3.88-12.38.58-.77,1.7-1.21,1.11-2.41-.54-1.1-1.69-.88-2.65-.88-3.34-.02-5.18,1.82-5.93,4.93-1.42,5.82-11.37,11.43-16.92,9.53-2.28-.78-2.4-2.6-1.88-4.48.3-1.09,1.74-2.24,1.52-3.03-2.68-9.3,5.73-9.75,10.41-12.7,3.89-2.45,5.69-4.57,3.52-9.13-1.57-3.32,1.1-7.62,4.43-6.9,4.18.9,7.06-.87,10.02-2.97,2.75-1.96,2.83-.73,4.11,1.86,2.15,4.35,1.29,9.08,2.51,12.85,1.88,5.77,7.05,10.67,11.47,15.33,1.94,2.05,3.36,3.52,2.41,6.27-.43,1.25-.49,2.28.79,3,.99.56,1.9.27,2.78-.35.67-.48,1.57-.77,2.05-1.39,4.77-6.13,10.12-10.84,18.66-10.98,3.34-.05,3.29-3.19,2.52-6.2-1.82-7.1-.71-10.73,3.61-13.03,3.18-1.7,6.06-2.15,7.14,2.51.22.94.77,1.85,1.34,2.66.75,1.06,1.83,1.46,3.05.78,1.17-.65,1.71-1.76,1.07-2.95-1.48-2.76-2.95-5.57-4.78-8.09-1.54-2.12-3.55-1.78-5.69-.33-3.69,2.52-7.66,5.59-12.3,2.93-4.98-2.85-5.6-7.95-6.04-13.36-.49-5.89,2.02-9.5,7-11.05,11.63-3.61,18.43-13.13,26.73-20.84,1.11-1.03,1.74-2.24.24-3.33-2.68-1.95-1.06-2.88.77-3.81,12.48-6.37,25.6-10.47,39.63-11.81,7.63-.73,14.64.47,21.34,4.08,7.71,4.15,16.7,3.83,24.71,7,5.29,2.09,11.22,2.85,14.37,8.73,1.17,2.18,3.98,1.69,5.9.75,2.33-1.15,1.08-3.07.32-4.74-.56-1.23-2.54-2.2-1-3.86,1.19-1.28,2.69-.76,4.2-.4,1.59.37,3.28.36,4.92.52v126.97c-2.28-.48-4.35-1.35-6.39-2.57-4.3-2.57-9.22-3.79-13.81-1.61-4.2,1.99-6.56.45-8.92-2.51-1.14-1.42-2.17-2.93-3.38-4.28-2.66-2.98-5.25-2.69-7.26.63-3.09,5.09-5.8,10.41-9.01,15.41-1.33,2.07-.63,3.41.41,4.92,3.18,4.61,8.87,6.12,15.03,3.04,8.11-4.04,15.98-4.03,23.79.06,3.12,1.63,6.19,2.1,9.53,1.91v87.98c-2.89-.87-3.69-3.54-4.89-5.81-1.39-2.64-2.86-5.21-4.88-7.42-1.16-1.27-2.46-2.38-4.27-1.07-1.63,1.18-2.4,2.75-1.65,4.74.35.92.84,1.8,1.37,2.63,3.06,4.9,5.96,9.84,8.14,15.25,1.21,3.01,1.84,6.97,6.18,7.67v226.95ZM515.8,286.05c1.93.43,5.56-1.32,6.4,1.39,1.11,3.6,2.59,7.88.91,11.48-1.33,2.84-.57,4.11,1.14,5.99,2.27,2.48,4.94,3.91,8.23,4.09,5.23.28,9.63,2.21,13.09,6.17,2.97,3.4,7.09,5,11.08,6.5,4.85,1.81,7.92-.19,8.27-4.63.44-5.63,5.77-9.33,10.98-7.05,7.28,3.18,14.69,5.8,22.37,7.79,5.07,1.32,9.87,3.43,15-.27,2.82-2.03,6.13-1.66,9.36.29,3.85,2.34,7.3,1.54,9.73-2.54,2.21-3.71,4.58-7.31,6.73-11.05,1.61-2.8-2.65-13.63-5.63-14.82-1.54-.61-2.5.26-3.59,1.04-2.64,1.87-6.06,2.73-8.45,1.02-3.68-2.63-6.72-1.9-10.1-.15-.91.47-1.84.75-2.87.44-4.55-1.32-10.37,2-13.71-4.07-.82-1.49-2.61.05-3.94.72-1.63.82-3.5,1.41-4.7-.77-2.07-3.76-4.05-4.18-6.41-.53-2.2,3.41-3.94,3.1-6.74,1.01-4.02-3-5.34-7.6-7.86-11.41-3.88-5.86-5.64-11.37-5.19-18.05.16-2.39-1.12-2.5-3.23-2.09-3.53.68-6.61-.41-9.58-2.73-4.08-3.2-7.64-6.9-11.34-10.47-1.34-1.29-2.88-1.8-4.51-.77-1.5.95-1.91,2.92-.83,3.92,4.65,4.33,6.98,11.06,13.8,13.17,4.23,1.31,7.16,4.63,10.33,7.5.81.73,1.93,2.43.09,2.57-3.92.3-5.99.92-3.08,5.11.21.31-.55,1.45-1.03,2.06-2.66,3.39-5.39,6.71-8.05,10.1-1.34,1.71-2.81,1.81-4.81,1.11-2.81-.98-4.4-3.46-6.73-5.01-1.58-1.05-.41-2.53,1.03-2.86,1.22-.28,2.6.1,3.91.21,3.43.28,6.54-1.36,8.26-3.66,1.78-2.39-1.42-4.26-2.96-6.07-5.16-6.05-12.47-9.22-18.66-13.9-1.04-.78-2.17-1.21-2.56-2.79-1.6-6.56-4.02-7.53-9.93-4.04-4.49,2.65-8.92,4.84-14.45,3.12-2.41-.75-4.98.36-5.37,3.12-.63,4.49-3.66,6.16-7.19,8.01-3.88,2.04-8.29,4.17-8.95,9.25-1.28,9.79-7.13,15.25-17.11,15.5-1.5.04-2.97,0-4.38.73-1.41.73-2.55,1.54-2.49,3.35.07,1.84,1.57,2.02,2.79,2.32,4.27,1.05,8.55,1.06,12.74-.43,6.38-2.27,12.57-5.63,19.14-6.66,10.09-1.58,20.44-1.58,31.09-2.27ZM538.33,194.06c.51-.07,1.28.03,1.8-.29,4.81-2.86,10.12-2.73,15.42-2.75,5.42-.02,6.95-1.72,7.42-7.03.42-4.77.96-10.11,4.06-13.54,4.18-4.63,1.93-5.62-1.94-8.08-7.16-4.54-6.81-12.61.27-17.25,1.39-.91,2.92-1.6,4.29-2.53,1.81-1.22,3.09-2.97,1.78-5.05-1.43-2.27-3.73-1.92-5.69-.62-1.22.81-2.69,1.91-3.08,3.18-1.28,4.15-4.57,5.82-8,7.64-7.57,4.04-8.38,8.55-2.63,14.8,1.72,1.87,1.88,3.01.08,4.94-3.11,3.33-5.33,7.2-5.19,12.02.07,2.29-1.17,4.44-3.27,4.28-4.53-.34-5.9,5.29-10.41,4.87-1.09-.1-1.29,1.72-.3,2.8,1.41,1.53,3.15,2.41,5.4,2.61ZM524.09,72.12c-2.28,0-3.72,1.39-4.07,3.63-.34,2.21.4,3.62,2.79,4.51,2.58.96,5.25,1.78,7.55,3.6,5.97,4.74,8.73,4.56,14.78-.51,2.59-2.17,4.82-3.04,7.67-.05,2.94,3.1,6.69,2.14,10.16.69,1.28-.54,2.53-1.71,1.06-3.05-4.6-4.18-.33-4.12,2.23-4.86,1.42-.41,2.88-.7,4.34-.97,1.32-.24,2.9-.32,2.87-2.08-.03-1.74-1.63-1.66-2.92-2-5.72-1.5-11.54-.79-19.49-1.06-7.69-1.34-17.2,2.13-26.97,2.14ZM428.5,142.1c1.94-1.55,4.54-2.63,3.02-5.83-1.31-2.77-2.89-5.19-6.53-5.24-4.16-.07-8.26.09-12.29,1.25-3.72,1.07-7.21,1.18-11.01-.56-3.51-1.6-6.88.26-8.96,3.36-1.78,2.65.11,4.5,1.67,6.9,3.85,5.93,9.41,5.11,15.59,5.04,6.31.57,12.84-.4,18.51-4.91ZM66.82,367.81c-.9.72-1.86,1.64-1.49,2.95.41,1.48,1.82,1.36,2.92,1.2,3.3-.47,7.58,1.88,9.33-3.24.28-.83,1.6-.95,2.22-.54,5.22,3.45,12.68,3.04,16.08,9.82,1.07,2.13,3.11,5.21,5.93,4.68,3.67-.69,7.27-.49,10.89-.69,1.42-.08,2.72-.39,3.1-1.95.44-1.79-.76-2.96-2.12-3.54-1.71-.73-3.11-1.78-4.62-2.8-8.53-5.73-17.1-11.48-28.97-11.78-4.89-.82-9.1,2.52-13.28,5.88ZM141.13,385.01c-4.05-2.76-8.74-3.91-13.34-4.81-2.82-.55-6.65-1.59-8.77,1.62-1.45,2.21-2.49,4.48-4.92,5.96-1.53.93-1.35,3.23.31,3.6,4.7,1.06,9.66,2.54,14.27,1.94,3.94-.52,7.74-2.64,12.01-2.36,1.56.1,3.02-.33,3.02-2.34-.55-1.48-1.24-2.68-2.59-3.6ZM517.84,257.62c-.05-1.25-.77-2.19-2.09-2.39-1.36-.21-2.3.57-2.62,1.76-1.35,5.08-2.45,10.22-2.06,15.52.13,1.77,1.35,3.18,3.16,3.3,2.13.14,3.39-1.42,3.58-3.35.25-2.45.06-4.94.06-7.42,0-2.47.06-4.95-.03-7.42Z"/>
  </svg>`;
}

const getMobileBg$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: getMobileBg
}, Symbol.toStringTag, { value: 'Module' }));

const getCookie = (name) => document.cookie
  .split('; ')
  .find((row) => row.startsWith(`${name}=`))
  ?.split('=')[1];

const geo2jsonp = (callback) => {
  // Setup a unique name that can be called & destroyed
  const callbackName = `jsonp_${Math.round(100000 * Math.random())}`;

  const script = document.createElement('script');
  script.src = `https://geo2.adobe.com/json/?callback=${callbackName}`;

  // Define the function that the script will call
  window[callbackName] = (data) => {
    delete window[callbackName];
    document.body.removeChild(script);
    callback(data);
  };

  document.body.appendChild(script);
};

const getAkamaiCode = () => new Promise((resolve) => {
  const urlParams = new URLSearchParams(window.location.search);
  const akamaiLocale = urlParams.get('akamaiLocale') || sessionStorage.getItem('akamai');
  if (akamaiLocale !== null) {
    resolve(akamaiLocale.toLowerCase());
  } else {
    geo2jsonp((data) => {
      const code = data.country.toLowerCase();
      sessionStorage.setItem('akamai', code);
      resolve(code);
    });
  }
});

// Determine if any of the locales can be linked to.
async function getAvailableLocales(locales, config, getMetadata) {
  const fallback = getMetadata('fallbackrouting') || config.fallbackRouting;

  const { contentRoot } = config.locale;
  const path = window.location.href.replace(contentRoot, '');

  const availableLocales = [];
  const pagesExist = [];
  for (const [index, locale] of locales.entries()) {
    const prefix = locale.prefix ? `/${locale.prefix}` : '';
    const localeRoot = `${prefix}${config.contentRoot ?? ''}`;
    const localePath = `${localeRoot}${path}`;

    const pageExistsRequest = fetch(localePath, { method: 'HEAD' }).then((resp) => {
      if (resp.ok) {
        locale.url = localePath;
        availableLocales[index] = locale;
      } else if (fallback !== 'off') {
        locale.url = `${localeRoot}/`;
        availableLocales[index] = locale;
      }
    });
    pagesExist.push(pageExistsRequest);
  }
  if (pagesExist.length > 0) await Promise.all(pagesExist);

  return availableLocales.filter((a) => !!a);
}

function buildText(locales, config, createTag) {
  const fragment = new DocumentFragment();
  const wrapper = createTag('div', { class: 'text-wrapper' });
  locales.forEach((locale) => {
    const lang = config.locales[locale.prefix]?.ietf ?? '';
    const text = createTag('p', { class: 'locale-text', lang }, locale.text);
    wrapper.append(text);
  });
  fragment.append(wrapper);
  return fragment;
}

function buildLinks(locales, config, createTag) {
  const fragment = new DocumentFragment();
  const wrapper = createTag('div', { class: 'link-wrapper' });
  locales.forEach((locale) => {
    const lang = config.locales[locale.prefix]?.ietf ?? '';
    const link = createTag('a', { class: 'locale-link', lang, href: locale.url }, locale.button);
    const para = createTag('p', { class: 'locale-link-wrapper' }, link);
    wrapper.append(para);
    link.addEventListener('click', () => {
      const modPrefix = locale.prefix || 'us';
      // set cookie so legacy code on adobecom still works properly.
      document.cookie = `international=${modPrefix};path=/`;
      sessionStorage.setItem('international', modPrefix);
      link.closest('.dialog-modal').dispatchEvent(new Event('closeModal'));
    });
  });
  fragment.append(wrapper);
  return fragment;
}

function getCodes(data) {
  return data.akamaiCodes.split(',').map((a) => a.toLowerCase().trim());
}

function getMatches(data, suppliedCode) {
  return data.reduce((rdx, locale) => {
    const localeCodes = getCodes(locale);
    if (localeCodes.some((code) => code === suppliedCode)) rdx.push(locale);
    return rdx;
  }, []);
}

async function getDetails(currentPage, localeMatches, config, createTag, getMetadata) {
  const availableLocales = await getAvailableLocales(localeMatches, config, getMetadata);

  if (availableLocales && availableLocales.length > 0) {
    currentPage.url = window.location.hash ? document.location.href : '#';
    const imgUrl = `${config.miloLibs || config.codeRoot}/img/icons/Smock_GlobeOutline_18_N.svg`;
    const worldIcon = createTag('img', { src: imgUrl, class: 'world-icon' });
    const text = buildText([...availableLocales, currentPage], config, createTag);
    const links = buildLinks([...availableLocales, currentPage], config, createTag);
    const detailsFragment = new DocumentFragment();
    detailsFragment.append(worldIcon, text, links);
    return detailsFragment;
  }
  return null;
}

async function showModal(details) {
  const { getModal } = await Promise.resolve().then(() => modal);
  return getModal(null, { class: 'locale-modal', id: 'locale-modal', content: details, closeEvent: 'closeModal' });
}

async function loadGeoRouting(config, createTag, getMetadata) {
  const { locale } = config;

  const urlLocale = locale.prefix.replace('/', '');
  const storedInter = sessionStorage.getItem('international') || getCookie('international');
  const storedLocale = storedInter === 'us' ? '' : storedInter;

  const resp = await fetch(`${config.contentRoot ?? ''}/georouting.json`);
  if (!resp.ok) return;
  const json = await resp.json();

  const urlGeoData = json.data.find((d) => d.prefix === urlLocale);
  if (!urlGeoData) return;

  if (storedLocale || storedLocale === '') {
    // Show modal when url and cookie disagree
    if (urlLocale.split('_')[0] !== storedLocale.split('_')[0]) {
      const localeMatches = json.data.filter((d) => d.prefix === storedLocale);
      const details = await getDetails(urlGeoData, localeMatches, config, createTag, getMetadata);
      if (details) { await showModal(details); }
    }
    return;
  }

  // Show modal when derived countries from url locale and akamai disagree
  const akamaiCode = await getAkamaiCode();
  if (akamaiCode && !getCodes(urlGeoData).includes(akamaiCode)) {
    const localeMatches = getMatches(json.data, akamaiCode);
    const details = await getDetails(urlGeoData, localeMatches, config, createTag, getMetadata);
    if (details) { await showModal(details); }
  }
}

const georouting = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: loadGeoRouting,
  getCookie
}, Symbol.toStringTag, { value: 'Module' }));

const IMS_CLIENT_ID = 'milo_ims';
const IMS_PROD_URL = 'https://auth.services.adobe.com/imslib/imslib.min.js';

const getImsToken = async (loadScript) => {
  window.adobeid = {
    client_id: IMS_CLIENT_ID,
    environment: 'prod',
    scope: 'AdobeID,openid',
  };

  if (!window.adobeIMS) {
    await loadScript(IMS_PROD_URL);
  }
  return window.adobeIMS?.getAccessToken()?.token;
};

/* eslint-disable */
const HEX_DIGITS = '0123456789abcdef'.split('');

const sha1 = async (message) => {
  const data = new TextEncoder().encode(message);
  const hashBuf = await crypto.subtle.digest('SHA-1', data);
  return hashBuf;
};

const uint8ToHex = (int) => {
  const first = int >> 4;
  const second = int - (first << 4);
  return HEX_DIGITS[first] + HEX_DIGITS[second];
};

const uint8ArrayToHex = (buf) => [...buf]
  .map((int) => uint8ToHex(int))
  .join('');

// generates uuid v5
const hashToUuid = (buf) =>
  [
    uint8ArrayToHex(buf.slice(0, 4)),
    '-',
    uint8ArrayToHex(buf.slice(4, 6)),
    '-',
    uint8ToHex((buf[6] & 0x0f) | parseInt(5 * 10, 16)),
    uint8ToHex(buf[7]),
    '-',
    uint8ToHex((buf[8] & 0x3f) | 0x80),
    uint8ToHex(buf[9]),
    '-',
    uint8ArrayToHex(buf.slice(10, 16)),
  ].join('');

const getUuid = async (str) => {
  const buf = await sha1(str);
  return hashToUuid(new Uint8Array(buf));
};

/* eslint-disable compat/compat */
/* eslint-disable no-underscore-dangle */

const LOCALES = {
  // Americas
  ar: { ietf: 'es-AR' },
  br: { ietf: 'pt-BR' },
  ca: { ietf: 'en-CA' },
  ca_fr: { ietf: 'fr-CA' },
  cl: { ietf: 'es-CL' },
  co: { ietf: 'es-CO' },
  cr: { ietf: 'es-CR' },
  ec: { ietf: 'es-EC' },
  el: { ietf: 'es-EL' },
  gt: { ietf: 'es-GT' },
  la: { ietf: 'es-LA' },
  mx: { ietf: 'es-MX' },
  pe: { ietf: 'es-PE' },
  pr: { ietf: 'es-PR' },
  '': { ietf: 'en-US' },
  langstore: { ietf: 'en-US' },
  // EMEA
  africa: { ietf: 'en-africa' },
  be_fr: { ietf: 'fr-BE' },
  be_en: { ietf: 'en-BE' },
  be_nl: { ietf: 'nl-BE' },
  cy_en: { ietf: 'en-CY' },
  dk: { ietf: 'da-DK' },
  de: { ietf: 'de-DE' },
  ee: { ietf: 'et-EE' },
  eg_ar: { ietf: 'ar-EG' },
  eg_en: { ietf: 'en-GB' },
  es: { ietf: 'es-ES' },
  fr: { ietf: 'fr-FR' },
  gr_en: { ietf: 'en-GR' },
  gr_el: { ietf: 'el-GR' },
  ie: { ietf: 'en-IE' },
  il_en: { ietf: 'en-IL' },
  il_he: { ietf: 'he-il' },
  it: { ietf: 'it-IT' },
  kw_ar: { ietf: 'ar-KW' },
  kw_en: { ietf: 'en-GB' },
  lv: { ietf: 'lv-LV' },
  lt: { ietf: 'lt-LT' },
  lu_de: { ietf: 'de-LU' },
  lu_en: { ietf: 'en-LU' },
  lu_fr: { ietf: 'fr-LU' },
  hu: { ietf: 'hu-HU' },
  mt: { ietf: 'en-MT' },
  mena_en: { ietf: 'en-mena' },
  mena_ar: { ietf: 'ar-mena' },
  ng: { ietf: 'en-NG' },
  nl: { ietf: 'nl-NL' },
  no: { ietf: 'no-NO' },
  pl: { ietf: 'pl-PL' },
  pt: { ietf: 'pt-PT' },
  qa_ar: { ietf: 'ar-QA' },
  qa_en: { ietf: 'en-GB' },
  ro: { ietf: 'ro-RO' },
  sa_en: { ietf: 'en-sa' },
  ch_fr: { ietf: 'fr-CH' },
  ch_de: { ietf: 'de-CH' },
  ch_it: { ietf: 'it-CH' },
  si: { ietf: 'sl-SI' },
  sk: { ietf: 'sk-SK' },
  fi: { ietf: 'fi-FI' },
  se: { ietf: 'sv-SE' },
  tr: { ietf: 'tr-TR' },
  ae_en: { ietf: 'en-ae' },
  uk: { ietf: 'en-GB' },
  at: { ietf: 'de-AT' },
  cz: { ietf: 'cs-CZ' },
  bg: { ietf: 'bg-BG' },
  ru: { ietf: 'ru-RU' },
  ua: { ietf: 'uk-UA' },
  ae_ar: { ietf: 'ar-ae' },
  sa_ar: { ietf: 'ar-sa' },
  za: { ietf: 'en-ZA' },
  // Asia Pacific
  au: { ietf: 'en-AU' },
  hk_en: { ietf: 'en-HK' },
  in: { ietf: 'en-in' },
  id_id: { ietf: 'id-id' },
  id_en: { ietf: 'en-id' },
  my_ms: { ietf: 'ms-my' },
  my_en: { ietf: 'en-my' },
  nz: { ietf: 'en-nz' },
  ph_en: { ietf: 'en-ph' },
  ph_fil: { ietf: 'fil-PH' },
  sg: { ietf: 'en-SG' },
  th_en: { ietf: 'en-th' },
  in_hi: { ietf: 'hi-in' },
  th_th: { ietf: 'th-th' },
  cn: { ietf: 'zh-CN' },
  hk_zh: { ietf: 'zh-HK' },
  tw: { ietf: 'zh-TW' },
  jp: { ietf: 'ja-JP' },
  kr: { ietf: 'ko-KR' },
  vn_en: { ietf: 'en-vn' },
  vn_vi: { ietf: 'vi-VN' },
};

const pageConfig = getConfig$1();
Object.keys(pageConfig.locales || {});

const CAAS_TAG_URL = 'https://www.adobe.com/chimera-api/tags';
const HLX_ADMIN_STATUS = 'https://admin.hlx.page/status';
const URL_POSTXDM = 'https://14257-milocaasproxy.adobeio-static.net/api/v1/web/milocaas/postXDM';
const VALID_URL_RE = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
const VALID_MODAL_RE = /fragments(.*)#[a-zA-Z0-9_-]+$/;

const isKeyValPair = /(\s*\S+\s*:\s*\S+\s*)/;
const isValidUrl = (u) => VALID_URL_RE.test(u);
const isValidModal = (u) => VALID_MODAL_RE.test(u);

const [setConfig, getConfig] = (() => {
  let config = {
    isInjectedDoc: () => undefined.doc !== document,
    doc: document,
  };
  return [
    (c) => {
      config = { ...config, ...c };
      return config;
    },
    () => config,
  ];
})();

const getKeyValPairs = (s) => {
  if (!s) return [];
  return s
    .split(',')
    .filter((v) => v.length)
    .filter((v) => isKeyValPair.test(v))
    .map((v) => {
      const [key, ...value] = v.split(':');
      return {
        key: key.trim(),
        value: value.join(':').trim(),
      };
    });
};

const addHost = (url) => {
  if (url.startsWith('http')) return url;
  const { host } = getConfig();
  return `https://${host}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getMetaContent = (propType, propName) => {
  const metaEl = getConfig().doc.querySelector(`meta[${propType}='${propName}']`);
  if (!metaEl) return undefined;
  return metaEl.content;
};

const prefixHttps = (url) => {
  if (!(url?.startsWith('https://') || url?.startsWith('http://'))) {
    return `https://${url}`;
  }
  return url;
};

const flattenLink = (link) => {
  const htmlElement = document.createElement('div');
  htmlElement.innerHTML = link;
  return htmlElement.querySelector('a').getAttribute('href');
};

const checkUrl = (url, errorMsg) => {
  if (url === undefined || isValidModal(url)) return url;
  const flatUrl = url.includes('href=') ? flattenLink(url) : url;
  if (isValidModal(flatUrl)) {
    return flatUrl;
  }
  return isValidUrl(flatUrl) ? prefixHttps(flatUrl) : { error: errorMsg };
};

// Case-insensitive search through tag name, path, id and title for the searchStr
const findTag = (tags, searchStr, ignore = []) => {
  const childTags = [];
  let matchingTag = Object.values(tags).find((tag) => {
    if (
      ignore.includes(tag.title)
      || ignore.includes(tag.name)
      || ignore.includes(tag.path)
      || ignore.includes(tag.tagID)
    ) return false;

    if (tag.tags && Object.keys(tag.tags).length) {
      childTags.push(tag.tags);
    }

    const tagMatches = [
      tag.title.toLowerCase(),
      tag.name,
      tag.path,
      tag.path.replace('/content/cq:tags/', ''),
      tag.tagID,
    ];

    if (tagMatches.includes(searchStr.toLowerCase())) return true;

    return false;
  });

  if (!matchingTag) {
    childTags.some((childTag) => {
      matchingTag = findTag(childTag, searchStr, ignore);
      return matchingTag;
    });
  }

  return matchingTag;
};

const [getCaasTags, loadCaasTags] = (() => {
  let tags;
  return [
    () => tags,
    async () => {
      try {
        const resp = await fetch(CAAS_TAG_URL);
        if (resp.ok) {
          const json = await resp.json();
          tags = json.namespaces.caas.tags;
          return;
        }
      } catch (e) {
        // ignore
      }
      const { default: caasTags } = await Promise.resolve().then(() => caasTags$1);
      tags = caasTags.namespaces.caas.tags;
    }];
})();

const getTag = (tagName, errors) => {
  if (!tagName) return undefined;
  const caasTags = getCaasTags();
  // search all except Events first
  const tag = findTag(caasTags, tagName, ['Events']) || findTag(caasTags.events.tags, tagName, []);

  if (!tag) {
    errors.push(tagName);
  }

  return tag;
};

const getTags = (s) => {
  let rawTags = [];
  if (s) {
    rawTags = s.toLowerCase().split(/,|(\s+)|(\\n)|;/g).filter((t) => t && t.trim() && t !== '\n');
  }

  const errors = [];

  const tagIds = rawTags.map((tag) => getTag(tag, errors))
    .filter((tag) => tag !== undefined)
    .map((tag) => tag.tagID);

  const tags = [...new Set(tagIds)]
    .map((tagID) => ({ id: tagID }));

  return {
    tagErrors: errors,
    tags,
  };
};

const getDateProp = (dateStr, errorMsg) => {
  if (!dateStr) return undefined;
  try {
    const date = new Date(dateStr);
    if (date.getFullYear() < 2000) return { error: `${errorMsg} - Date is before the year 2000` };
    return date.toISOString();
  } catch (e) {
    return { error: errorMsg };
  }
};

const processRepoForFloodgate = (repo, fgColor) => {
  if (repo && fgColor && fgColor !== 'default') {
    return repo.slice(0, repo.lastIndexOf(`-${fgColor}`));
  }
  return repo;
};

const getOrigin = (fgColor) => {
  const { project, repo } = getConfig();
  const origin = project || processRepoForFloodgate(repo, fgColor);

  const mappings = {
    cc: 'hawks',
    dc: 'doccloud',
  };
  const originLC = (mappings[origin] || origin).toLowerCase();
  if (originLC) {
    return originLC;
  }

  if (window.location.hostname.endsWith('.hlx.page')) {
    const [, singlePageRepo] = window.location.hostname.split('.')[0].split('--');
    return processRepoForFloodgate(singlePageRepo, fgColor);
  }

  throw new Error('No Project or Repo defined in config');
};

const getUrlWithoutFile = (url) => `${url.split('/').slice(0, -1).join('/')}/`;

const getImagePathMd = (keyName) => {
  const mdEl = getConfig().doc.querySelector('.card-metadata');
  if (!mdEl) return null;

  let url = '';
  [...mdEl.children].some((n) => {
    const key = n.firstElementChild.textContent?.trim().toLowerCase();
    if (key !== keyName) return false;

    const img = n.lastElementChild.querySelector('img');

    if (img) {
      let imgSrc = img.src;
      if (getConfig().bulkPublish) {
        const rawImgSrc = img.attributes.src.value;
        if (rawImgSrc.startsWith('./')) {
          const urlWithoutFile = getUrlWithoutFile(getConfig().pageUrl);
          imgSrc = `${urlWithoutFile}${rawImgSrc}`;
        } else if (rawImgSrc.startsWith('/')) {
          imgSrc = `${new URL(getConfig.pageUrl.origin)}${rawImgSrc}`;
        } else {
          imgSrc = rawImgSrc;
        }
      }
      url = new URL(imgSrc)?.pathname;
    } else { // url string to img
      url = n.lastElementChild.textContent?.trim();
    }
    return true;
  });
  return url;
};

const getCardImageUrl = () => {
  const { doc } = getConfig();
  const imageUrl = getImagePathMd('image')
    || getImagePathMd('cardimage')
    || getImagePathMd('cardimagepath')
    || doc.querySelector('main')?.querySelector('img')?.src.replace(/\?.*/, '')
    || doc.querySelector('meta[property="og:image"]')?.content;

  if (!imageUrl) return null;
  return addHost(imageUrl);
};

const getCardImageAltText = () => {
  // eslint-disable-next-line no-use-before-define
  const pageMd = parseCardMetadata();
  if (pageMd.cardimage) return '';
  const cardImageUrl = getCardImageUrl();
  const cardImagePath = new URL(cardImageUrl).pathname.split('/').pop();
  const imgTagForCardImage = getConfig().doc.querySelector(`img[src*="${cardImagePath}"]`);
  return imgTagForCardImage?.alt;
};

const getBadges = (p) => {
  const badges = [];
  if (p.badgeimage) {
    badges.push({ type: 'image', value: addHost(p.badgeimage) });
  }
  if (p.badgetext) {
    badges.push({ type: 'text', value: p.badgetext });
  }
  return badges;
};

const isPagePublished = async () => {
  let { branch, repo, owner } = getConfig();
  if (!(branch || repo || owner)
    && window.location.hostname.endsWith('.hlx.page')) {
    [branch, repo, owner] = window.location.hostname.split('.')[0].split('--');
  }

  if (!(branch || repo || owner)) {
    throw new Error(`Branch, Repo or Owner is not set - branch: ${branch}, repo: ${repo}, owner: ${owner}`);
  }

  const res = await fetch(
    `${HLX_ADMIN_STATUS}/${owner}/${repo}/${branch}${window.location.pathname}`,
  );
  if (res.ok) {
    const json = await res.json();
    return json.live.status === 200;
  }
  return false;
};

const getBulkPublishLangAttr = async (options) => {
  let { getLocale } = getConfig();
  if (!getLocale) {
    // This is only imported from the bulk publisher so there is no dependency cycle
    // eslint-disable-next-line import/no-cycle
    const { getLocale: utilsGetLocale } = await Promise.resolve().then(() => utils);
    getLocale = utilsGetLocale;
    setConfig({ getLocale });
  }
  return getLocale(LOCALES, options.prodUrl).ietf;
};

const getCountryAndLang = async (options) => {
  const langStr = window.location.pathname === '/tools/send-to-caas/bulkpublisher.html'
    ? await getBulkPublishLangAttr(options)
    : (LOCALES[window.location.pathname.split('/')[1]] || LOCALES['']).ietf;
  const langAttr = langStr?.toLowerCase().split('-') || [];

  const [lang = 'en', country = 'us'] = langAttr;
  return {
    country,
    lang,
  };
};

const parseCardMetadata = () => {
  const pageMd = {};
  const marqueeMetadata = getConfig().doc.querySelector('.caas-marquee-metadata');
  const cardMetadata = getConfig().doc.querySelector('.card-metadata');
  const mdEl = cardMetadata || marqueeMetadata;
  const allowHtml = ['description'];
  if (mdEl) {
    mdEl.childNodes.forEach((n) => {
      const key = n.children?.[0]?.textContent?.toLowerCase();
      let val = n.children?.[1]?.textContent;
      if (marqueeMetadata && allowHtml.includes(key)) {
        val = n.children?.[1]?.innerHTML;
      }
      if (!key) return;

      pageMd[key] = val;
    });
  }
  return pageMd;
};

function checkCtaUrl(s, options, i) {
  if (s?.trim() === '') return '';
  const url = s || options.prodUrl || window.location.origin + window.location.pathname;
  return checkUrl(url, `Invalid Cta${i}Url: ${url}`);
}

/** card metadata props - either a func that computes the value or
 * 0 to use the string as is
 * funcs that return an object with { error: string } will report the error
 */
const props = {
  arbitrary: (s) => getKeyValPairs(s).map((pair) => ({ key: pair.key, value: pair.value })),
  badgeimage: () => getImagePathMd('badgeimage'),
  badgetext: 0,
  bookmarkaction: 0,
  bookmarkenabled: (s = '') => {
    if (s) {
      const lcs = s.toLowerCase();
      if (lcs === 'true' || lcs === 'on' || lcs === 'yes') {
        return true;
      }
    }
    return undefined;
  },
  bookmarkicon: 0,
  carddescription: 0,
  cardtitle: 0,
  cardimage: () => getCardImageUrl(),
  cardimagealttext: (s) => s || getCardImageAltText(),
  contentid: (_, options) => getUuid(options.prodUrl),
  contenttype: (s) => s || getMetaContent('property', 'og:type') || getConfig().contentType,
  country: async (s, options) => {
    if (s) return s;
    const { country } = await getCountryAndLang(options);
    return country;
  },
  created: (s) => {
    if (s) {
      return getDateProp(s, `Invalid Created Date: ${s}`);
    }
    const cardDate = parseCardMetadata()?.carddate;
    if (cardDate) {
      return getDateProp(cardDate, `Invalid Date: ${cardDate}`);
    }

    const pubDate = getMetaContent('name', 'publishdate') || getMetaContent('name', 'publication-date');
    const { doc, lastModified } = getConfig();
    return pubDate
      ? getDateProp(pubDate, `publication-date metadata is not a valid date: ${pubDate}`)
      : getDateProp(lastModified || doc.lastModified, `document.lastModified is not a valid date: ${doc.lastModified}`);
  },
  cta1icon: (s) => checkUrl(s, `Invalid Cta1Icon url: ${s}`),
  cta1style: 0,
  cta1target: 0,
  cta1text: 0,
  cta1url: (s, options) => checkCtaUrl(s, options, 1),
  cta2icon: (s) => checkUrl(s, `Invalid Cta2Icon url: ${s}`),
  cta2style: 0,
  cta2target: 0,
  cta2text: 0,
  cta2url: (s) => checkCtaUrl(s, {}, 2),
  description: (s) => s || getMetaContent('name', 'description') || '',
  details: 0,
  entityid: (_, options) => {
    const floodGateColor = options.floodgatecolor || getMetadata$4('floodgatecolor') || '';
    const salt = floodGateColor === 'default' || floodGateColor === '' ? '' : floodGateColor;
    return getUuid(`${options.prodUrl}${salt}`);
  },
  env: (s) => s || '',
  eventduration: 0,
  eventend: (s) => getDateProp(s, `Invalid Event End Date: ${s}`),
  eventstart: (s) => getDateProp(s, `Invalid Event Start Date: ${s}`),
  floodgatecolor: (s, options) => s || options.floodgatecolor || getMetadata$4('floodgatecolor') || 'default',
  lang: async (s, options) => {
    if (s) return s;
    const { lang } = await getCountryAndLang(options);
    return lang;
  },
  modified: (s) => {
    const { doc, lastModified } = getConfig();
    return s
      ? getDateProp(s, `Invalid Modified Date: ${s}`)
      : getDateProp(lastModified || doc.lastModified, `document.lastModified is not a valid date: ${doc.lastModified}`);
  },
  origin: (s, options) => {
    if (s) return s;
    const fgColor = options.floodgatecolor || getMetadata$4('floodgatecolor');
    return getOrigin(fgColor);
  },

  playurl: (s) => checkUrl(s, `Invalid PlayURL: ${s}`),
  primarytag: (s) => {
    const tag = getTag(s);
    return tag ? { id: tag.tagID } : {};
  },
  style: (s) => s || 'default',
  tags: (s) => getTags(s),
  title: (s) => s || getMetaContent('property', 'og:title') || '',
  uci: (s, options) => s || options.prodUrl || window.location.pathname,
  url: (s, options) => {
    const url = s || options.prodUrl || window.location.origin + window.location.pathname;
    return checkUrl(url, `Invalid URL: ${url}`);
  },
};

// Map the flat props into the structure needed by CaaS
const getCaasProps = (p) => {
  const caasProps = {
    entityId: p.entityid,
    contentId: p.contentid,
    contentType: p.contenttype,
    environment: p.env,
    url: p.url,
    floodGateColor: p.floodgatecolor,
    universalContentIdentifier: p.uci,
    title: p.cardtitle || p.title,
    description: p.carddescription || p.description,
    createdDate: p.created,
    modifiedDate: p.modified,
    tags: p.tags,
    primaryTag: p.primarytag,
    ...(p.cardimage && {
      thumbnail: {
        altText: p.cardimagealttext,
        url: p.cardimage,
      },
    }),
    country: p.country,
    language: p.lang,
    cardData: {
      style: p.style,
      headline: p.cardtitle || p.title,
      ...(p.details && { details: p.details }),
      ...((p.bookmarkenabled || p.bookmarkicon || p.bookmarkaction) && {
        bookmark: {
          enabled: p.bookmarkenabled,
          bookmarkIcon: p.bookmarkicon,
          action: p.bookmarkaction,
        },
      }),
      badges: getBadges(p),
      ...(p.playurl && { playUrl: p.playurl }),
      ...((p.cta1url || p.cta2url) && {
        cta: {
          ...(p.cta1url && {
            primaryCta: {
              text: p.cta1text,
              url: p.cta1url,
              style: p.cta1style,
              icon: p.cta1icon,
              target: p.cta1target,
            },
          }),
          ...(p.cta2url && {
            secondaryCta: {
              text: p.cta2text,
              url: p.cta2url,
              style: p.cta2style,
              icon: p.cta2icon,
              target: p.cta2target,
            },
          }),
        },
      }),
      ...((p.eventduration || p.eventstart || p.eventend) && {
        event: {
          duration: p.eventduration,
          startDate: p.eventstart,
          endDate: p.eventend,
        },
      }),
    },
    origin: p.origin,
    ...(p.arbitrary?.length && { arbitrary: p.arbitrary }),
  };
  return caasProps;
};

const getCaaSMetadata = async (pageMd, options) => {
  const md = {};
  const errors = [];
  let tagErrors = [];
  let tags = [];
  // for-of required to await any async computeVal's
  for (const [key, computeFn] of Object.entries(props)) {
    const val = computeFn ? await computeFn(pageMd[key], options) : pageMd[key];
    if (val?.error) {
      errors.push(val.error);
    } else if (val?.tagErrors !== undefined) {
      tagErrors = val.tagErrors;
      md[key] = val.tags;
      tags = val.tags.map((t) => t.id);
    } else if (val !== undefined) {
      md[key] = val;
    }
  }
  if (!md.contenttype && tags.length) {
    md.contenttype = tags.find((tag) => tag.startsWith('caas:content-type'));
  }

  return { caasMetadata: md, errors, tags, tagErrors };
};

const getCardMetadata = async (options) => {
  const pageMd = parseCardMetadata();
  return getCaaSMetadata(pageMd, options);
};

const postDataToCaaS = async ({ accessToken, caasEnv, caasProps, draftOnly }) => {
  const options = {
    method: 'POST',
    body: JSON.stringify(caasProps),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      draft: !!draftOnly,
      'caas-env': caasEnv,
    },
  };

  let response;
  const res = await fetch(URL_POSTXDM, options);
  if (res !== undefined) {
    const text = await res.text();

    try {
      response = JSON.parse(text);
    } catch {
      response = text;
    }
  }
  return response;
};

/* eslint-disable new-cap */
/* global tingle */
/* eslint-disable no-alert */

const [setPublishingTrue, setPublishingFalse, isPublishing] = (() => {
  let publishing = false;
  return [
    () => { publishing = true; },
    () => { publishing = false; },
    () => publishing,
  ];
})();

// Tingle is the js library for displaying modals
const loadTingleModalFiles = async (loadScript, loadStyle) => {
  if (!window.tingle?.modal) {
    await Promise.all([
      loadScript('https://milo.adobe.com/libs/deps/tingle.js'),
      loadStyle('https://milo.adobe.com/libs/deps/tingle.css'),
    ]);
  }
};

const showAlert = (msg, { error = false, onClose, showBtn = true, btnText = 'OK' } = {}) => {
  const modal = new tingle.modal({
    footer: true,
    closeMethods: ['overlay', 'escape'],
    onClose() {
      if (onClose) { onClose(); }
      this.destroy();
    },
  });
  let msgContent = msg;
  if (error) { // show alert icon
    msgContent = `<div class="modal-error"><div class="modal-alert"></div><div>${msg}</div></div>`;
  }
  modal.setContent(msgContent);
  if (showBtn) {
    modal.addFooterBtn(btnText, 'tingle-btn tingle-btn--primary tingle-btn--pull-right', () => modal.close());
  }
  modal.open();
  return modal;
};

const showConfirm = (msg, {
  onClose,
  cssClass = [],
  ctaBtnType = 'primary',
  ctaText = 'OK',
  cancelBtnType = 'default',
  cancelText = 'Cancel',
  footerContent = '',
  initCode,
  leftButton,
} = {}) => new Promise((resolve) => {
  let ok = false;
  const modal = new tingle.modal({
    cssClass,
    footer: true,
    closeMethods: ['escape'],
    onClose() {
      if (onClose) onClose(this);
      this.destroy();
      resolve(ok);
    },
  });
  modal.setContent(msg);
  if (footerContent) {
    modal.setFooterContent(footerContent);
  }

  if (ctaText) {
    modal.addFooterBtn(ctaText, `tingle-btn tingle-btn--${ctaBtnType} tingle-btn--pull-right`, () => {
      ok = true;
      modal.close();
    });
  }

  modal.addFooterBtn(cancelText, `tingle-btn tingle-btn--${cancelBtnType} tingle-btn--pull-right`, () => {
    ok = false;
    modal.close();
  });
  if (leftButton) {
    modal.addFooterBtn(leftButton.text, 'tingle-btn tingle-btn--default tingle-btn--pull-left', () => {
      leftButton.callback?.();
    });
  }

  if (initCode) initCode(modal.modal);

  modal.open();
});

const displayPublishingModal = () => {
  const publishingModal = new tingle.modal({
    closeMethods: [],
    cssClass: ['modal-text-align-center'],
    onClose() {
      this.destroy();
    },
  });
  publishingModal.setContent('Publishing to CaaS...');
  publishingModal.open();
  return publishingModal;
};

const verifyInfoModal = async (tags, tagErrors, showAllPropertiesAlert) => {
  let okToContinue = false;
  let draftOnly = false;
  let useHtml = false;
  let caasEnv;

  const seeAllPropsBtn = {
    text: 'See all properties',
    callback: showAllPropertiesAlert,
  };

  const footerOptions = `
    <div class="verify-info-footer">
      <div class="caas-env">
        <label for="caas-env-select">CaaS Env</label>
        <select name="1A" id="caas-env-select">
          <option>Prod</option>
          <option>Stage</option>
          <option>Dev</option>
        </select>
      </div>
      <div id="caas-draft-cb">
        <input type="checkbox" id="draftcb" name="draftcb">
        <label for="draftcb">Publish to Draft only</label>
      </div>
      <div id="caas-use-html-cb" class="field checkbox">
        <input type="checkbox" id="usehtml" name="usehtml">
        <label for="usehtml">Use .html extension</label>
      </div>
    </div>`;

  const onClose = () => {
    caasEnv = document.getElementById('caas-env-select')?.value?.toLowerCase();
    draftOnly = document.getElementById('draftcb')?.checked;
    useHtml = document.getElementById('usehtml')?.checked;
  };

  const modalInit = (modal) => {
    const caasEnvSelect = modal.querySelector('#caas-env-select');
    const caasEnvVal = caasEnvSelect.value?.toLowerCase();
    const useHtmlCb = modal.querySelector('#usehtml');
    if (caasEnvVal === 'prod') {
      useHtmlCb.checked = true;
    }
    caasEnvSelect.addEventListener('change', (e) => {
      useHtmlCb.checked = e.target.value?.toLowerCase() === 'prod';
    });
  };

  if (!tags.length) {
    const msg = '<div><p><b>No Tags found on page</b></p><p>Please add at least one tag to the Card Metadata</p></div>';
    okToContinue = await showConfirm(msg, {
      cssClass: ['verify-info-modal'],
      ctaText: '',
      cancelBtnType: 'danger',
      cancelText: 'Cancel Registration',
      footerContent: footerOptions,
      leftButton: seeAllPropsBtn,
      onClose,
    });
  } else if (tagErrors.length) {
    const msg = [
      '<div class="">',
      '<p><b>The following tags were not found:</b></p>',
      tagErrors.join('<br>'),
      '<p><b>Ok to publish without those tags defined?</b></p>',
      '<p>The following tags will be used:</p>',
      tags.join('<br>'),
      '</div>',
    ].join('');
    okToContinue = await showConfirm(msg, {
      cssClass: ['verify-info-modal'],
      ctaText: 'Publish with missing tags',
      cancelBtnType: 'grey',
      cancelText: 'Cancel Registration',
      ctaBtnType: 'danger',
      footerContent: footerOptions,
      initCode: modalInit,
      leftButton: seeAllPropsBtn,
      onClose,
    });
  } else {
    const msg = [
      '<div><p><b>The following tags will be used:</b></p>',
      tags.join('<br>'),
      '<p><b>Please verify that these are correct.</b></p></div>',
    ].join('');
    okToContinue = await showConfirm(msg, {
      cssClass: ['verify-info-modal'],
      cancelBtnType: 'grey',
      cancelText: 'Cancel Registration',
      ctaText: 'Continue with these tags',
      footerContent: footerOptions,
      initCode: modalInit,
      leftButton: seeAllPropsBtn,
      onClose,
    });
  }
  return {
    caasEnv,
    draftOnly,
    okToContinue,
    useHtml,
  };
};

const isUseHtmlChecked = () => document.getElementById('usehtml')?.checked;

const sortObjByPropName = (obj) => Object.keys(obj)
  // eslint-disable-next-line no-return-assign, no-sequences
  .sort().reduce((c, d) => (c[d] = obj[d], c), {});

const validateProps = async (prodHost, publishingModal) => {
  const { caasMetadata, errors, tags, tagErrors } = await getCardMetadata(
    { prodUrl: `${prodHost}${window.location.pathname}` },
  );

  const showAllPropertiesAlert = async () => {
    const { caasMetadata: cMetaData } = await getCardMetadata(
      { prodUrl: `${prodHost}${window.location.pathname}${isUseHtmlChecked() ? '.html' : ''}` },
    );
    const mdStr = JSON.stringify(sortObjByPropName(cMetaData), undefined, 4);
    showAlert(`<h3>All CaaS Properties</h3><pre id="json" style="white-space:pre-wrap;font-size:14px;">${mdStr}</pre>`);
  };

  const { draftOnly, caasEnv, okToContinue, useHtml } = await verifyInfoModal(
    tags,
    tagErrors,
    showAllPropertiesAlert,
  );

  if (!okToContinue) {
    setPublishingFalse();
    publishingModal.close();
    return false;
  }

  if (errors.length) {
    publishingModal.close();
    const msg = [
      '<p>There were problems with the following:</p>',
      errors.join('<br>'),
      '<p>Publishing to CaaS aborted, please fix errors and try again.</p>',
    ].join('');
    showAlert(msg, { error: true, onClose: setPublishingFalse });
    return false;
  }

  let metaWithUseHtml;
  if (useHtml) {
    ({ caasMetadata: metaWithUseHtml } = await getCardMetadata(
      { prodUrl: `${prodHost}${window.location.pathname}.html` },
    ));
  }

  return {
    caasEnv,
    caasMetadata: metaWithUseHtml || caasMetadata,
    draftOnly,
  };
};

const checkPublishStatus = async (publishingModal) => {
  if (!(await isPagePublished())) {
    publishingModal.close();
    showAlert(
      'Page must be published before it can be registered with CaaS.<br>Please publish the page and try again.',
      { error: true },
    );
    setPublishingFalse();
    return false;
  }
  return true;
};

const checkIms = async (publishingModal, loadScript) => {
  const accessToken = await getImsToken(loadScript);
  if (!accessToken) {
    publishingModal.close();
    const shouldLogIn = await showConfirm(
      'You must be logged in with an Adobe ID in order to publish to CaaS.\nDo you want to log in?',
    );
    if (shouldLogIn) {
      window.adobeIMS.signIn();
    }
    setPublishingFalse();
    return false;
  }
  return accessToken;
};

const postToCaaS = async ({ accessToken, caasEnv, caasProps, draftOnly, publishingModal }) => {
  try {
    const response = await postDataToCaaS({ accessToken, caasEnv, caasProps, draftOnly });

    publishingModal.close();

    if (response.success) {
      showAlert(
        `<p>Successfully published page to CaaS!<p><p>Card ID: ${caasProps.entityId}</p>`,
        { onClose: setPublishingFalse },
      );
    } else if (response.error?.startsWith('Invalid User: Not an Adobe employee')) {
      const msg = 'Please login with your Adobe company account.  Do you want to try logging in again?';
      const shouldLogIn = await showConfirm(msg, {
        cancelBtnType: 'grey',
        cancelText: 'Cancel',
        ctaText: 'Login',
      });
      setPublishingFalse();
      if (shouldLogIn) window.adobeIMS.signIn();
    } else {
      showAlert(
        response.message || response.error || JSON.stringify(response),
        { error: true, onClose: setPublishingFalse },
      );
    }
  } catch (e) {
    publishingModal.close();
    setPublishingFalse();
    showAlert(`Error posting to CaaS:<br>${e.message}`, { error: true });
  }
};

const noop = () => {};

const sendToCaaS = async ({ host = '', project = '', branch = '', repo = '', owner = '' } = {}, loadScript = noop, loadStyle = noop) => {
  if (isPublishing()) return;

  await loadTingleModalFiles(loadScript, loadStyle);
  if (window.adobeid?.environment !== 'prod') {
    showAlert(
      'Send to CaaS needs to reload the page with prod IMS setup.  Please try again after reload.',
      {
        onClose: () => {
          const url = new URL(window.location);
          url.searchParams.append('env', 'prod');
          window.location.assign(url);
        },
      },
    );
    return;
  }

  setConfig({
    host: host || window.location.host, project, branch, repo, owner, doc: document,
  });

  loadStyle('https://milo.adobe.com/tools/send-to-caas/send-to-caas.css');

  setPublishingTrue();
  const publishingModal = displayPublishingModal();

  try {
    if (!host) throw new Error('host must be specified');

    await loadCaasTags();
    const { caasEnv, caasMetadata, draftOnly } = await validateProps(host, publishingModal);
    if (!caasMetadata) return;

    const isPublished = await checkPublishStatus(publishingModal);
    if (!isPublished) return;

    const accessToken = await checkIms(publishingModal, loadScript);
    if (!accessToken) return;

    const caasProps = getCaasProps(caasMetadata);

    postToCaaS({ accessToken, caasEnv, caasProps, draftOnly, publishingModal });
  } catch (e) {
    setPublishingFalse();
    publishingModal.close();
    showAlert(`ERROR: ${e.message}`, { error: true });
  }
};

const sendToCaas = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  loadTingleModalFiles,
  sendToCaaS,
  showAlert,
  showConfirm
}, Symbol.toStringTag, { value: 'Module' }));

function debounce(callback, time = 300) {
  if (typeof callback !== 'function') return undefined;

  let timer = null;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), time);
  };
}

const MOBILE_MAX = 599;
const TABLET_MAX = 1199;

window.addEventListener('pageshow', (event) => {
  // if there is a commerce modal with an iframe open, reload the page to avoid bfcache issues.
  if (event.persisted && document.querySelector('.dialog-modal.commerce-frame iframe')) {
    window.location.reload();
  }
});

function adjustModalHeight(contentHeight) {
  if (!(window.location.hash || document.getElementById('checkout-link-modal'))) return;
  let selector = '#checkout-link-modal';
  if (!/=/.test(window.location.hash)) selector = `${selector},div.dialog-modal.commerce-frame${window.location.hash}`;
  const dialog = document.querySelector(selector);
  const iframe = dialog?.querySelector('iframe');
  const iframeWrapper = dialog?.querySelector('.milo-iframe');
  if (!contentHeight || !iframe || !iframeWrapper) return;
  if (contentHeight === '100%') {
    iframe.style.height = '100%';
    iframeWrapper.style.removeProperty('height');
    dialog.style.removeProperty('height');
  } else {
    const verticalMargins = 20;
    const clientHeight = document.documentElement.clientHeight - verticalMargins;
    if (clientHeight <= 0) return;
    const newHeight = contentHeight > clientHeight ? clientHeight : contentHeight;
    iframe.style.height = '100%';
    iframeWrapper.style.height = `${newHeight}px`;
    dialog.style.height = `${newHeight}px`;
  }
}

function sendViewportDimensionsToIframe(source) {
  const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  source.postMessage({ mobileMax: MOBILE_MAX, tabletMax: TABLET_MAX, viewportWidth }, '*');
}

function sendViewportDimensionsOnRequest(source) {
  sendViewportDimensionsToIframe(source);
  window.addEventListener('resize', debounce(() => sendViewportDimensionsToIframe(source), 10));
}

function reactToMessage({ data, source }) {
  if (data === 'viewportWidth' && source) {
    /* If the page inside iframe comes from another domain, it won't be able to retrieve
    the viewport dimensions, so it sends a request to receive the viewport dimensions
    from the parent window. */
    sendViewportDimensionsOnRequest(source);
  }

  if (data?.contentHeight) {
    /* If the page inside iframe sends the postMessage with its content height,
    we activate the height auto adjustment to eliminate the blank space at the bottom of the modal.
    For this we set the iframe height to 0% in CSS to let the page inside iframe
    to measure its content height properly.
    Then we set the modal height to be the same as the content height we received.
    For the modal height adjustment to work the following conditions must be met:
    1. The modal must have the class 'commerce-frame';
    2. The page inside iframe must send a postMessage with the contentHeight (in px, or '100%); */
    adjustModalHeight(data?.contentHeight);
  }
}

function adjustStyles({ dialog, iframe }) {
  const isAutoHeightAdjustment = /\/mini-plans\/.*mid=ft.*web=1/.test(iframe.src); // matches e.g. https://www.adobe.com/mini-plans/photoshop.html?mid=ft&web=1
  if (isAutoHeightAdjustment) {
    dialog.classList.add('height-fit-content');
    // fail safe.
    setTimeout(() => {
      const { height } = window.getComputedStyle(iframe);
      if (height === '0px') {
        iframe.style.height = '100%';
      }
    }, 2000);
  } else {
    iframe.style.height = '100%';
  }
}

async function enableCommerceFrameFeatures({ dialog, iframe }) {
  if (!dialog || !iframe) return;
  adjustStyles({ dialog, iframe });
  window.addEventListener('message', reactToMessage);
}

const modal_merch = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  MOBILE_MAX,
  TABLET_MAX,
  adjustModalHeight,
  adjustStyles,
  default: enableCommerceFrameFeatures,
  sendViewportDimensionsOnRequest,
  sendViewportDimensionsToIframe
}, Symbol.toStringTag, { value: 'Module' }));

let chatInitialized = false;
let loadScript;
let loadStyle;
let getMetadata;

const isSilentEvent = (data) => (data['event.workflow'] === 'init' && data['event.type'] === 'request')
  || (data['event.workflow'] === 'Chat' && data['event.type'] === 'load' && data['event.subtype'] === 'window');

const getBaseEvent = (data) => ({
  chatConversationId: data['event.context_guid'],
  chatConversationSessionId: data['event.session_guid'],
  chatWorkflow: data['event.workflow'],
  chatCategory: data['event.category'],
  chatSubcategory: data['event.subcategory'],
  chatType: data['event.type'],
  chatSubtype: data['event.subtype'],
  chatUserguid: data['event.user_guid'],
  chatLanguage: data['event.language'],
  chatPagename: data['event.pagename'],
  chatVisitorguid: data['event.visitor_guid'],
  chatUrl: data['event.url'],
  chatOrgguid: data['event.org_guid'],
  chatReferrer: data['event.referrer'],
  chatClientId: data['source.client_id'],
  chatSourceName: data['source.name'],
  chatPlatform: data['source.platform'],
  chatContentName: data['content.name'],
  chatEnv: data['env.com.name'],
});

const setSophiaLayer = (data) => {
  const sophiaData = {
    variationId: data['exp.variation_id'],
    actionBlockId: data['exp.action_block_id'],
    campaignId: data['exp.campaign_id'],
    containerId: data['exp.container_id'],
    controlGroupId: data['exp.control_group_id'],
    treatmentId: data['exp.treatment_id'],
    surfaceId: data['exp.surface_id'],
  };

  Object.keys(sophiaData).forEach((key) => {
    if (!sophiaData[key]) delete sophiaData[key];
  });
  if (!Object.keys(sophiaData).length) return;

  const sophiaDataCaptured = (id) => {
    let captured = false;
    if (!id) return captured;

    const sophiaDataLayer = window.digitalData.sophiaResponse?.fromPage;
    if (Array.isArray(sophiaDataLayer)) {
      captured = sophiaDataLayer.some((sophiaEvent) => sophiaEvent?.campaignId === id);
    } else {
      captured = (sophiaDataLayer?.campaignId === id);
    }

    return captured;
  };

  if (sophiaDataCaptured(sophiaData.campaignId)) return;

  window.digitalData.sophiaResponse ||= {};
  window.digitalData.sophiaResponse.fromPage ||= [];

  if (Array.isArray(window.digitalData.sophiaResponse.fromPage)) {
    window.digitalData.sophiaResponse.fromPage.push(sophiaData);
  } else {
    window.digitalData.sophiaResponse.fromPage = sophiaData;
  }
};

const sendEvent = (data) => {
  setSophiaLayer(data);
  // eslint-disable-next-line no-underscore-dangle
  window._satellite?.track('event', {
    xdm: {},
    data: {
      web: { webInteraction: { name: window.digitalData.primaryEvent?.eventInfo?.eventName } },
      _adobe_corpnew: {
        digitalData: {
          primaryEvent: window.digitalData.primaryEvent,
          chat: window.digitalData.chat,
          sophiaResponse: window.digitalData.sophiaResponse,
        },
      },
    },
  });
};

const getDataProperties = (data, properties = []) => properties.reduce((str, prop) => {
  let output = str;
  output += `${output && ':'}${data[prop] || ''}`;
  return output;
}, '');

const sendChatIconRenderEvent = (data) => {
  window.digitalData.primaryEvent = {
    eventInfo: {
      eventName: `chat:${getDataProperties(data, ['event.workflow', 'event.subcategory', 'event.subtype', 'content.name', 'event.type'])}`,
      eventAction: getDataProperties(data, ['event.subcategory', 'content.name', 'event.type']),
    },
  };

  window.digitalData.chat = {};
  window.digitalData.chat.chatInfo = getBaseEvent(data);
  window.digitalData.chat.chatInfo.chatConversationUnread = data['content.name'];

  sendEvent(data);
};

const sendChatIconClickEvent = (data) => {
  window.digitalData.primaryEvent = {
    eventInfo: {
      eventName: `chat:${getDataProperties(data, ['event.workflow', 'event.subcategory', 'event.subtype', 'content.name', 'event.type'])}`,
      eventAction: getDataProperties(data, ['event.subcategory', 'event.subtype', 'content.name', 'event.type']),
    },
  };

  window.digitalData.chat = {};
  window.digitalData.chat.chatInfo = getBaseEvent(data);
  window.digitalData.chat.chatInfo.chatConversationUnread = data['content.name'];

  sendEvent(data);
};

const sendProductEvent = (data) => {
  window.digitalData.primaryEvent = {
    eventInfo: {
      eventName: `chat:${getDataProperties(data, ['event.workflow', 'content.name', 'event.subtype', 'event.type'])}`,
      eventAction: getDataProperties(data, ['event.subcategory', 'content.name', 'event.subtype', 'event.type']),
    },
  };

  window.digitalData.chat = { chatInfo: { primaryProduct: { productName: data['event.subtype'] } } };

  sendEvent(data);
};

const sendSurveyFeedbackEvent = (data) => {
  window.digitalData.primaryEvent = {
    eventInfo: {
      eventName: `chat:${getDataProperties(data, ['event.workflow', 'content.name', 'event.subtype', 'event.type', 'content.id'])}`,
      eventAction: getDataProperties(data, ['event.subcategory', 'content.name', 'event.subtype', 'event.type']),
    },
  };

  sendEvent(data);
};

const sendChatErrorEvent = (data) => {
  window.digitalData.primaryEvent = {
    eventInfo: {
      eventName: `chat:${getDataProperties(data, ['event.workflow', 'event.subtype', 'event.type'])}:error`,
      eventAction: `${getDataProperties(data, ['event.subcategory', 'event.subtype', 'event.type'])}:error`,
    },
  };

  window.digitalData.chat = {};
  window.digitalData.chat.chatInfo = getBaseEvent(data);
  window.digitalData.chat.chatInfo.chatErrorCode = data['event.error_code'];
  window.digitalData.chat.chatInfo.chatErrorType = data['event.error_type'];
  window.digitalData.chat.chatInfo.chatErrorDescription = data['event.error_desc'];

  sendEvent(data);
};

const sendPrimaryEvent = (data) => {
  window.digitalData.primaryEvent = {
    eventInfo: {
      eventName: `chat:${getDataProperties(data, ['event.workflow', 'content.name', 'event.subtype', 'event.type'])}`,
      eventAction: getDataProperties(data, ['event.subcategory', 'content.name', 'event.subtype', 'event.type']),
    },
  };

  window.digitalData.chat = {};
  window.digitalData.chat.chatInfo = getBaseEvent(data);

  sendEvent(data);
};

const redirectToSupport = () => window.location.assign('https://helpx.adobe.com');

const isChatOpen = () => {
  const instance = window.AdobeMessagingExperienceClient;
  return instance?.isAdobeMessagingClientInitialized()
    && instance?.getMessagingExperienceState()?.windowState !== 'hidden';
};

const openChat = (event) => {
  if (!chatInitialized) redirectToSupport();
  const open = window.AdobeMessagingExperienceClient?.openMessagingWindow;
  if (typeof open !== 'function' || isChatOpen()) return;
  if (event) {
    const sourceType = event.target.tagName?.toLowerCase();
    const sourceText = (sourceType === 'img') ? event.target.alt?.trim() : event.target.innerText?.trim();
    open({
      sourceType,
      sourceText,
    });
  } else {
    open({});
  }
};

const startInitialization = async (config, event, onDemand) => {
  const asset = 'https://client.messaging.adobe.com/latest/AdobeMessagingClient';
  await Promise.all([
    loadStyle(`${asset}.css`),
    loadScript(`${asset}.js`),
  ]);
  let language;
  let region;
  if (config.locale.ietf.includes('-')) {
    [language, region] = config.locale.ietf.split('-');
  } else {
    [region, language] = config.locale.prefix.replace('/', '').split('_');
    if (region === 'africa') region = 'ZA';
  }

  window.AdobeMessagingExperienceClient.initialize({
    appid: getMetadata('jarvis-surface-id') || config.jarvis.id,
    appver: getMetadata('jarvis-surface-version') || config.jarvis.version,
    env: config.env.name !== 'prod' ? 'stage' : 'prod',
    clientId: window.adobeid?.client_id,
    accessToken: window.adobeIMS?.isSignedInUser()
      ? `Bearer ${window.adobeIMS.getAccessToken()?.token}` : undefined,
    lazyLoad: true,
    loadedVia: 'milo',
    language: language || 'en',
    region,
    cookiesEnabled: window.adobePrivacy?.activeCookieGroups()?.length > 1,
    cookies: {
      mcid: window.alloy ? await window.alloy('getIdentity')
        .then((data) => data?.identity?.ECID).catch(() => undefined) : undefined,
    },
    callbacks: {
      initCallback: (data) => {
        chatInitialized = !!data?.releaseControl?.showAdobeMessaging;
      },
      onReadyCallback: () => {
        if (onDemand) {
          openChat(event);
        }
      },
      initErrorCallback: () => {},
      chatStateCallback: () => {},
      getContextCallback: () => {},
      signInProvider: window.adobeIMS?.signIn,
      analyticsCallback: (eventData) => {
        if (!window.alloy_all || !window.digitalData) return;
        const data = eventData?.events?.[0]?.data;
        if (!data || isSilentEvent(data)) return;
        if (data['event.subcategory']?.toLowerCase() === 'launch'
          && data['event.workflow']?.toLowerCase() === 'init') {
          if (data['event.type']?.toLowerCase() === 'render') {
            sendChatIconRenderEvent(data);
            return;
          }
          if (data['event.type']?.toLowerCase() === 'click') {
            sendChatIconClickEvent(data);
            return;
          }
        }
        if (data['content.name']?.toLowerCase() === 'auth-subproduct') {
          sendProductEvent(data);
          return;
        }
        if (data['content.name']?.toLowerCase() === '5-star-survey') {
          sendSurveyFeedbackEvent(data);
          return;
        }
        if (data['event.error_code'] && data['event.error_type']) {
          sendChatErrorEvent(data);
          return;
        }
        sendPrimaryEvent(data);
      },
    },
  });
};

const initJarvisChat = async (
  config,
  loadScriptFunction,
  loadStyleFunction,
  getMetadataFunction,
) => {
  if (!config?.jarvis) return;

  loadScript = loadScriptFunction;
  loadStyle = loadStyleFunction;
  getMetadata = getMetadataFunction;

  const onDemandMeta = getMetadata('jarvis-on-demand')?.toLowerCase();
  const onDemand = onDemandMeta ? onDemandMeta === 'on' : config.jarvis.onDemand;

  document.addEventListener('click', async (event) => {
    if (!event.target.closest('[href*="#open-jarvis-chat"]')) return;
    event.preventDefault();
    if (onDemand && !chatInitialized) {
      await startInitialization(config, event, onDemand);
    } else {
      openChat(event);
    }
  });
  if (!onDemand) {
    await startInitialization(config);
  }
};

const jarvisChat = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  initJarvisChat,
  openChat
}, Symbol.toStringTag, { value: 'Module' }));

const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client';
const GOOGLE_ID = '530526366930-l874a90ipfkn26naa71r010u8epp39jt.apps.googleusercontent.com';
const PLACEHOLDER = 'feds-googleLogin';
const WRAPPER = 'feds-profile';

const onToken = async (getMetadata, data) => {
  let destination;
  try {
    destination = new URL(getMetadata('google-login-redirect'))?.href;
  } catch {
    // Do nothing
  }

  await window.adobeIMS.socialHeadlessSignIn({
    provider_id: 'google',
    idp_token: data?.credential,
    client_id: window.adobeid?.client_id,
    scope: window.adobeid?.scope,
  }).then(() => {
    if (window.DISABLE_PAGE_RELOAD === true) return;
    // Existing account
    if (destination) {
      window.location.assign(destination);
    } else {
      window.location.reload();
    }
  }).catch(() => {
    // New account
    window.adobeIMS.signInWithSocialProvider('google', { redirect_uri: destination || window.location.href });
  });
};

async function initGoogleLogin(loadIms, getMetadata, loadScript) {
  try {
    await loadIms();
  } catch {
    return;
  }
  if (window.adobeIMS?.isSignedInUser()) return;

  await loadScript(GOOGLE_SCRIPT);
  const placeholder = document.createElement('div');
  placeholder.id = PLACEHOLDER;
  document.querySelector(`.${WRAPPER}`)?.append(placeholder);

  window.google?.accounts?.id?.initialize({
    client_id: GOOGLE_ID,
    callback: (data) => onToken(getMetadata, data),
    prompt_parent_id: PLACEHOLDER,
    cancel_on_tap_outside: false,
  });
  window.google?.accounts?.id?.prompt();
}

const googleLogin = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: initGoogleLogin
}, Symbol.toStringTag, { value: 'Module' }));

/**
 * Checks if a given match intersects with an existing match
 * before adding it to the list of matches. In case of an
 * intersection, the more specific (i.e. longer) match wins.
 * @param {array} matches The existing matches
 * @param {object} contender The match to check and add
 * @param {number} maxMatches The maximum number of matches
 */
function checkAndAddMatch(matches, contender, maxMatches) {
  const collisions = matches
    // check for intersections
    .filter((match) => !(contender.end < match.start || contender.start > match.end));
  if (collisions.length === 0 && matches.length < maxMatches) {
    // no intersecting existing matches, add contender if max not yet reached
    matches.push(contender);
  }
}

/**
 * Loops through a list of keywords and looks for matches in the article text.
 * The first occurrence of each keyword will be replaced with a link and tracking added.
 * The keywords file must have a column titled "Keyword".
 * @param {string} path The location of the keywords file to be used for interlinks.
 * @param {number} limit The maximum amount of keywords to fetch from the file.  Default is 1000.
 */
async function interlink(path, language, limit = 1000) {
  const isExceptionLanguage = ['zh', 'ko', 'ja', 'th', 'he'].includes(language);
  const articleBody = document.querySelector('main');
  const resp = await fetch(`${path}?limit=${limit}`);
  if (!(articleBody && resp.ok)) return;
  const json = await resp.json();
  const articleText = articleBody.textContent.toLowerCase();
  // set article link limit: 1 every 100 words
  const articleLinks = articleBody.querySelectorAll('a').length;
  const articleWords = articleText.split(/\s/).length;
  const maxLinks = (Math.floor(articleWords / 100)) - articleLinks;
  // eslint-disable-next-line no-useless-return
  if (maxLinks <= 0) return;
  const wordBorder = isExceptionLanguage ? '' : '\\b';
  const keywords = (Array.isArray(json) ? json : json.data)
    // scan article to filter keywords down to relevant ones
    .filter(({ Keyword }) => articleText.indexOf(Keyword.toLowerCase()) !== -1)
    // sort matches by length descending
    .sort((a, b) => b.Keyword.length - a.Keyword.length)
    // prepare regexps
    .map((item) => ({
      regexp: new RegExp(`${wordBorder}(${item.Keyword.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')})${wordBorder}`, 'iu'),
      ...item,
    }));
  // eslint-disable-next-line no-useless-return
  if (keywords.length === 0) return;
  // find exact text node matches and insert links
  articleBody
    .querySelectorAll('div > p:not([class])')
    .forEach((p) => {
      // set paragraph link limit: 1 every 40 words
      const paraLinks = p.querySelectorAll('a').length;
      const paraWords = p.textContent.split(/\s/).length;
      const maxParaLinks = Math.floor(paraWords / 40) - paraLinks;
      if (isExceptionLanguage || maxParaLinks > 0) {
        Array.from(p.childNodes)
        // filter out non text nodes
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .forEach((textNode) => {
            const matches = [];
            // find case-insensitive matches inside text node
            keywords.forEach((item) => {
              const match = item.regexp.exec(textNode.nodeValue);
              if (match) {
                checkAndAddMatch(matches, {
                  item,
                  start: match.index,
                  end: match.index + item.Keyword.length,
                }, maxParaLinks);
              }
            });
            matches
            // sort matches by start index descending
              .sort((a, b) => b.start - a.start)
            // split text node, insert link with matched text, and add link tracking
              .forEach(({ item, start, end }) => {
                const text = textNode.nodeValue;
                const a = document.createElement('a');
                a.title = item.Keyword;
                a.href = item.URL;
                a.setAttribute('data-origin', 'interlink');
                a.setAttribute('daa-ll', `${a.title}--interlinks_p_${item.Keyword}`);
                a.appendChild(document.createTextNode(text.substring(start, end)));
                p.insertBefore(a, textNode.nextSibling);
                p.insertBefore(document.createTextNode(text.substring(end)), a.nextSibling);
                textNode.nodeValue = text.substring(0, start);
                // remove matched link from interlinks
                keywords.splice(keywords.indexOf(item), 1);
              });
          });
      }
    });
}

const interlinks = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  checkAndAddMatch,
  default: interlink
}, Symbol.toStringTag, { value: 'Module' }));

const caasTags = {
  namespaces: {
    caas: {
      name: 'caas',
      title: 'CaaS',
      description: '',
      path: '/content/cq:tags/caas',
      tags: {
        'content-type': {
          path: '/content/cq:tags/caas/content-type',
          tagID: 'caas:content-type',
          name: 'content-type',
          tagImage: '',
          title: 'Content Type',
          'title.zh_cn': '内容类型',
          'title.pt': 'Tipo de conteúdo',
          'title.fr': 'Type de contenu',
          'title.ja': 'コンテンツの種類',
          'title.zh_tw': '內容類型',
          'title.it': 'Tipo di contenuto',
          'title.ko': '콘텐츠 유형',
          'title.de': 'Inhaltstyp',
          'title.es': 'Tipo de contenido',
          'title.hi': 'सामग्री प्रकार',
          'title.sv': 'Innehållstyp',
          'title.nl': 'Type Inhoud',
          'title.th': 'ประเภทเนื้อหา',
          description: '',
          'cq:movedTo': '',
          tags: {
            report: {
              path: '/content/cq:tags/caas/content-type/report',
              tagID: 'caas:content-type/report',
              name: 'report',
              tagImage: '',
              title: 'Report',
              'title.de': 'Bericht',
              'title.zh_cn': '报告',
              'title.es': 'Informe',
              'title.pt': 'relatório',
              'title.fr': 'Rapport ',
              'title.hi': 'रिपोर्ट',
              'title.sv': 'Rapport',
              'title.ja': 'レポート',
              'title.zh_tw': '報告',
              'title.it': 'Report',
              'title.ko': '보고서',
              'title.nl': 'Rapport',
              description: '.',
              'cq:movedTo': '',
              tags: {},
            },
            'customer-story': {
              path: '/content/cq:tags/caas/content-type/customer-story',
              tagID: 'caas:content-type/customer-story',
              name: 'customer-story',
              tagImage: '',
              title: 'Customer Story',
              'title.de': 'Kundenreferenz',
              'title.zh_cn': '客户案例',
              'title.es': 'Historia de cliente',
              'title.pt': 'Case de sucesso',
              'title.fr': 'Témoignage client',
              'title.sv': 'Kundberättelse',
              'title.ja': 'ユーザー事例',
              'title.zh_tw': '客戶故事',
              'title.it': 'Testimonianza del cliente',
              'title.ko': '고객 사례',
              'title.nl': 'Klantverhaal',
              'title.th': 'เรื่องราวของลูกค้า',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            video: {
              path: '/content/cq:tags/caas/content-type/video',
              tagID: 'caas:content-type/video',
              name: 'video',
              tagImage: '',
              title: 'Video',
              'title.zh_cn': '视频',
              'title.pt': 'Vídeo',
              'title.fr': 'Vidéo',
              'title.ja': 'ビデオ',
              'title.zh_tw': '視訊',
              'title.it': 'Video',
              'title.ko': '영상',
              'title.de': 'Video',
              'title.es': 'Vídeo',
              'title.hi': 'वीडियो',
              'title.sv': 'Video',
              'title.nl': 'Video',
              'title.th': 'วิดีโอ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            article: {
              path: '/content/cq:tags/caas/content-type/article',
              tagID: 'caas:content-type/article',
              name: 'article',
              tagImage: '',
              title: 'Article',
              'title.zh_cn': '文章',
              'title.pt': 'Artigo',
              'title.fr': 'Article',
              'title.ja': '記事',
              'title.zh_tw': '文章',
              'title.it': 'Articolo',
              'title.ko': '기사',
              'title.de': 'Artikel',
              'title.es': 'Artículo',
              'title.hi': 'आर्टिकल',
              'title.sv': 'Artikel',
              'title.nl': 'Artikel',
              'title.th': 'บทความ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            blog: {
              path: '/content/cq:tags/caas/content-type/blog',
              tagID: 'caas:content-type/blog',
              name: 'blog',
              tagImage: '',
              title: 'Blog',
              'title.zh_cn': '博客',
              'title.pt': 'Blog',
              'title.fr': 'Blog',
              'title.ja': 'ブログ',
              'title.zh_hk': '部落格',
              'title.zh_tw': '部落格',
              'title.it': 'Blog',
              'title.ko': '블로그',
              'title.de': 'Blog',
              'title.es': 'Blog',
              'title.sv': 'Blogg',
              'title.nl': 'Blog',
              'title.th': 'บล็อก',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            documentation: {
              path: '/content/cq:tags/caas/content-type/documentation',
              tagID: 'caas:content-type/documentation',
              name: 'documentation',
              tagImage: '',
              title: 'Documentation',
              'title.de': 'Dokumentation',
              'title.zh_cn': '文档',
              'title.es': 'Documentación',
              'title.pt': 'Documentação',
              'title.fr': 'Documentation',
              'title.sv': 'Dokumentation',
              'title.ja': 'ドキュメント',
              'title.zh_tw': '文件',
              'title.it': 'Documentazione',
              'title.ko': '설명서',
              'title.nl': 'Documentatie',
              'title.th': 'เอกสาร',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            webinar: {
              path: '/content/cq:tags/caas/content-type/webinar',
              tagID: 'caas:content-type/webinar',
              name: 'webinar',
              tagImage: '',
              title: 'Webinar',
              'title.zh_cn': '网络讲座',
              'title.pt': 'Webinário',
              'title.fr': 'Webinaire',
              'title.ja': 'オンデマンド ウェビナー',
              'title.zh_tw': '網路研討會',
              'title.it': 'Webinar',
              'title.ko': '온라인 세미나',
              'title.de': 'Webinar',
              'title.es': 'Seminario web',
              'title.hi': 'वेबिनार',
              'title.sv': 'Webbinarium',
              'title.nl': 'Webinar',
              'title.th': 'การสัมมนาผ่านเว็บ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            quiz: {
              path: '/content/cq:tags/caas/content-type/quiz',
              tagID: 'caas:content-type/quiz',
              name: 'quiz',
              tagImage: '',
              title: 'Quiz',
              'title.de': 'Quiz',
              'title.zh_cn': '测试',
              'title.es': 'Cuestionario',
              'title.pt': 'Teste',
              'title.fr': 'Questionnaire',
              'title.sv': 'Quiz',
              'title.ja': 'クイズ',
              'title.zh_tw': '測驗',
              'title.it': 'Questionario',
              'title.ko': '퀴즈',
              'title.nl': 'Quiz',
              'title.th': 'แบบทดสอบ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'event-session': {
              path: '/content/cq:tags/caas/content-type/event-session',
              tagID: 'caas:content-type/event-session',
              name: 'event-session',
              tagImage: '',
              title: 'Event Session',
              'title.zh_cn': '活动环节',
              'title.pt': 'SESSÃO DE EVENTO',
              'title.fr': 'Événement session',
              'title.ja': '近日公開予定 ウェビナー',
              'title.zh_tw': '活動會議',
              'title.it': 'Sessione',
              'title.ko': '이벤트 세션',
              'title.de': 'Event Session',
              'title.es': 'SESIÓN DEL EVENTO',
              'title.hi': 'इवेंट सेशन',
              'title.sv': 'Eventsession',
              'title.nl': 'Evenementsessie',
              'title.th': 'เซสชันกิจกรรม',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            event: {
              path: '/content/cq:tags/caas/content-type/event',
              tagID: 'caas:content-type/event',
              name: 'event',
              tagImage: '',
              title: 'Event',
              'title.de': 'Event',
              'title.zh_cn': '事件',
              'title.es': 'Evento',
              'title.pt': 'Evento',
              'title.fr': 'Évènement',
              'title.sv': 'Event',
              'title.ja': 'イベント',
              'title.zh_tw': '活動',
              'title.it': 'Evento',
              'title.ko': '이벤트',
              'title.nl': 'Evenement',
              'title.th': 'กิจกรรม',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            infographic: {
              path: '/content/cq:tags/caas/content-type/infographic',
              tagID: 'caas:content-type/infographic',
              name: 'infographic',
              tagImage: '',
              title: 'Infographic',
              'title.zh_cn': '信息图',
              'title.pt': 'Infográfico',
              'title.fr': 'Infographie',
              'title.ja': 'インフォグラフィック',
              'title.zh_tw': '資訊圖表',
              'title.it': 'Infografica',
              'title.ko': '인포그래픽',
              'title.de': 'Infographic',
              'title.es': 'Infografía',
              'title.hi': 'इनफ़ोग्राफ़िक',
              'title.sv': 'Infografik',
              'title.nl': 'Infographic',
              'title.th': 'อินโฟกราฟิก',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ebook: {
              path: '/content/cq:tags/caas/content-type/ebook',
              tagID: 'caas:content-type/ebook',
              name: 'ebook',
              tagImage: '',
              title: 'eBook',
              'title.zh_cn': '电子书',
              'title.pt': 'eBook',
              'title.fr': 'ebook',
              'title.ja': '電子ブック',
              'title.zh_tw': '電子書',
              'title.it': 'ebook',
              'title.ko': 'e북',
              'title.de': 'E-Book',
              'title.es': 'eBook',
              'title.hi': 'eBook',
              'title.sv': 'e-bok',
              'title.nl': 'E-book',
              'title.th': 'อีบุ๊ก',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            demo: {
              path: '/content/cq:tags/caas/content-type/demo',
              tagID: 'caas:content-type/demo',
              name: 'demo',
              tagImage: '',
              title: 'Demo',
              'title.zh_cn': '演示',
              'title.pt': 'Demonstração',
              'title.fr': 'Démonstration ',
              'title.ja': 'デモ',
              'title.zh_tw': '示範',
              'title.it': 'la demo',
              'title.ko': '데모',
              'title.de': 'Demo',
              'title.es': 'Demostración',
              'title.hi': 'डेमो',
              'title.sv': 'Demo',
              'title.nl': 'Demo',
              'title.th': 'ตัวอย่าง',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'event-speaker': {
              path: '/content/cq:tags/caas/content-type/event-speaker',
              tagID: 'caas:content-type/event-speaker',
              name: 'event-speaker',
              tagImage: '',
              title: 'Event Speaker',
              'title.de': 'Event-Speaker',
              'title.es': 'Ponente',
              'title.fr': 'Intervenant(e)',
              'title.hi': 'इवेंट स्पीकर',
              'title.it': 'Relatore',
              'title.nl': 'Spreker tijdens evenement',
              'title.th': 'วิทยากรในงาน',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            tutorial: {
              path: '/content/cq:tags/caas/content-type/tutorial',
              tagID: 'caas:content-type/tutorial',
              name: 'tutorial',
              tagImage: '',
              title: 'Tutorial',
              'title.de': 'Tutorial',
              'title.zh_cn': '教程',
              'title.es': 'Tutorial',
              'title.pt': 'Tutorial',
              'title.fr': 'Tutoriel',
              'title.sv': 'Självstudiekurs',
              'title.ja': 'チュートリアル',
              'title.zh_tw': '教學課程',
              'title.it': 'Tutorial',
              'title.ko': '튜토리얼',
              'title.nl': 'Tutorial',
              'title.th': 'บทแนะนำ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'product-tour': {
              path: '/content/cq:tags/caas/content-type/product-tour',
              tagID: 'caas:content-type/product-tour',
              name: 'product-tour',
              tagImage: '',
              title: 'Product Tour',
              'title.zh_cn': '产品导览',
              'title.pt': 'Tour de produto',
              'title.fr': 'Visite guidée du produit',
              'title.ja': '製品ツアー',
              'title.zh_tw': '產品導覽',
              'title.it': 'Presentazione del prodotto',
              'title.ko': '제품 둘러보기',
              'title.de': 'Produkttour',
              'title.es': 'Recorrido por el producto',
              'title.hi': 'प्रोडक्ट टूर',
              'title.sv': 'Produktrundtur',
              'title.nl': 'Productrondleiding',
              'title.th': 'ทัวร์แนะนำผลิตภัณฑ์',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            template: {
              path: '/content/cq:tags/caas/content-type/template',
              tagID: 'caas:content-type/template',
              name: 'template',
              tagImage: '',
              title: 'Template',
              'title.de': 'Vorlage',
              'title.zh_cn': '模板',
              'title.es': 'Plantilla',
              'title.pt': 'Modelo',
              'title.fr': 'Modèle',
              'title.sv': 'Mall',
              'title.ja': 'テンプレート',
              'title.zh_tw': '範本',
              'title.it': 'Modello',
              'title.ko': '템플릿',
              'title.nl': 'Sjabloon',
              'title.th': 'เทมเพลต',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            promotion: {
              path: '/content/cq:tags/caas/content-type/promotion',
              tagID: 'caas:content-type/promotion',
              name: 'promotion',
              tagImage: '',
              title: 'Promotion',
              'title.de': 'Promotion',
              'title.zh_cn': '促销',
              'title.es': 'Promoción',
              'title.pt': 'Promoção',
              'title.fr': 'Promotion',
              'title.sv': 'Kampanj',
              'title.ja': 'プロモーション',
              'title.zh_tw': '促銷',
              'title.it': 'Promozione',
              'title.ko': '프로모션',
              'title.nl': 'Promotie',
              'title.th': 'การโปรโมต/โปรโมชัน',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            certification: {
              path: '/content/cq:tags/caas/content-type/certification',
              tagID: 'caas:content-type/certification',
              name: 'certification',
              tagImage: '',
              title: 'Certification',
              'title.zh_cn': '认证',
              'title.pt': 'Certificação',
              'title.fr': 'Certification',
              'title.ja': '認証',
              'title.zh_hk': '認證',
              'title.zh_tw': '認證',
              'title.it': 'Certificazione',
              'title.ko': '인증',
              'title.de': 'Zertifizierung',
              'title.es': 'Certificación',
              'title.sv': 'Certifiering',
              'title.nl': 'Certificering',
              'title.th': 'การรับรอง',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            application: {
              path: '/content/cq:tags/caas/content-type/application',
              tagID: 'caas:content-type/application',
              name: 'application',
              tagImage: '',
              title: 'Application',
              'title.zh_cn': '应用',
              'title.pt': 'Aplicativo',
              'title.fr': 'Applications',
              'title.ja': 'アプリケーション',
              'title.zh_hk': '應用',
              'title.zh_tw': '應用',
              'title.it': 'Applicazione',
              'title.ko': '애플리케이션',
              'title.de': 'Programm',
              'title.es': 'Aplicación',
              'title.sv': 'Programvara',
              'title.nl': 'Applicatie',
              'title.th': 'แอปพลิเคชัน/การใช้/การสมัคร',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            podcast: {
              path: '/content/cq:tags/caas/content-type/podcast',
              tagID: 'caas:content-type/podcast',
              name: 'podcast',
              tagImage: '',
              title: 'Podcast',
              'title.de': 'Podcast',
              'title.zh_cn': '播客',
              'title.es': 'Podcast',
              'title.pt': 'Podcast',
              'title.fr': 'Podcast',
              'title.sv': 'Podcast',
              'title.ja': 'ポッドキャスト',
              'title.zh_tw': '播客',
              'title.it': 'Podcast',
              'title.ko': '팟캐스트',
              'title.nl': 'Podcast',
              'title.th': 'พอดแคสต์',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            guide: {
              path: '/content/cq:tags/caas/content-type/guide',
              tagID: 'caas:content-type/guide',
              name: 'guide',
              tagImage: '',
              title: 'Guide',
              'title.zh_cn': '指南',
              'title.pt': 'Guia',
              'title.fr': 'Guide ',
              'title.ja': 'ガイド',
              'title.zh_tw': '指南',
              'title.it': 'Guida',
              'title.ko': '가이드',
              'title.de': 'Leitfaden',
              'title.es': 'Guía',
              'title.hi': 'गाइड',
              'title.sv': 'Guide',
              'title.nl': 'Gids',
              'title.th': 'คู่มือ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            consulting: {
              path: '/content/cq:tags/caas/content-type/consulting',
              tagID: 'caas:content-type/consulting',
              name: 'consulting',
              tagImage: '',
              title: 'Consulting',
              'title.de': 'Consulting',
              'title.zh_cn': '咨询',
              'title.es': 'Consultoría',
              'title.pt': 'Consultoria',
              'title.fr': 'Conseil',
              'title.sv': 'Konsulttjänster',
              'title.ja': 'コンサルティング',
              'title.zh_tw': '諮詢',
              'title.it': 'Consulenza',
              'title.ko': '컨설팅',
              'title.nl': 'Consulting',
              'title.th': 'การให้คำปรึกษา',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            product: {
              path: '/content/cq:tags/caas/content-type/product',
              tagID: 'caas:content-type/product',
              name: 'product',
              tagImage: '',
              title: 'Product',
              'title.de': 'Produkt',
              'title.zh_cn': '产品',
              'title.es': 'Producto',
              'title.pt': 'Produto',
              'title.fr': 'Produit',
              'title.sv': 'Produkt',
              'title.ja': '製品',
              'title.zh_tw': '產品',
              'title.it': 'Prodotto',
              'title.ko': '제품',
              'title.nl': 'Product',
              'title.th': 'ผลิตภัณฑ์',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            partner: {
              path: '/content/cq:tags/caas/content-type/partner',
              tagID: 'caas:content-type/partner',
              name: 'partner',
              tagImage: '',
              title: 'Partner',
              'title.de': 'Partner',
              'title.zh_cn': '合作伙伴',
              'title.es': 'Partner',
              'title.pt': 'Parceiro',
              'title.fr': 'Partenaire',
              'title.sv': 'Partner',
              'title.ja': 'パートナー',
              'title.zh_tw': '合作夥伴',
              'title.it': 'Partner',
              'title.ko': '파트너',
              'title.nl': 'Partner',
              'title.th': 'พาร์ทเนอร์',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            solution: {
              path: '/content/cq:tags/caas/content-type/solution',
              tagID: 'caas:content-type/solution',
              name: 'solution',
              tagImage: '',
              title: 'Solution',
              'title.de': 'Lösung',
              'title.zh_cn': '解决方案',
              'title.es': 'Solución',
              'title.pt': 'Solução',
              'title.fr': 'Solution',
              'title.sv': 'Lösning',
              'title.ja': 'ソリューション',
              'title.zh_tw': '解決方案',
              'title.it': 'Soluzione',
              'title.ko': '솔루션',
              'title.nl': 'Oplossing',
              'title.th': 'โซลูชัน',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            course: {
              path: '/content/cq:tags/caas/content-type/course',
              tagID: 'caas:content-type/course',
              name: 'course',
              tagImage: '',
              title: 'Course',
              'title.sv_se': 'Kurs',
              'title.zh_cn': '课程',
              'title.ko_kr': '강의',
              'title.pt': 'Curso',
              'title.nl_nl': 'Cursus',
              'title.fr': 'Cours',
              'title.ja': 'コース',
              'title.zh_hk': '課程單元',
              'title.zh_tw': '課程單元',
              'title.it': 'Corso',
              'title.ko': '강의',
              'title.de': 'Kurs',
              'title.es': 'Curso',
              'title.sv': 'Kurs',
              'title.nl': 'Cursus',
              'title.th': 'หลักสูตร',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            document: {
              path: '/content/cq:tags/caas/content-type/document',
              tagID: 'caas:content-type/document',
              name: 'document',
              tagImage: '',
              title: 'Document',
              'title.de': 'Dokument',
              'title.es': 'Documento',
              'title.fr': 'Document',
              'title.hi': 'डॉक्युमेंट',
              'title.it': 'Documento',
              'title.nl': 'Document',
              'title.th': 'เอกสาร',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'solution-brief': {
              path: '/content/cq:tags/caas/content-type/solution-brief',
              tagID: 'caas:content-type/solution-brief',
              name: 'solution-brief',
              tagImage: '',
              title: 'Solution brief',
              'title.de': 'Einführung',
              'title.es': 'Resumen de la solución',
              'title.fr': 'Présentation rapide',
              'title.hi': 'सॉल्यूशन ब्रीफ़',
              'title.it': 'Presentazione della soluzione',
              'title.nl': 'Overzicht van oplossingen',
              'title.th': 'ข้อมูลสรุปโซโลชัน',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'how-to': {
              path: '/content/cq:tags/caas/content-type/how-to',
              tagID: 'caas:content-type/how-to',
              name: 'how-to',
              tagImage: '',
              title: 'How-to',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'white-paper': {
              path: '/content/cq:tags/caas/content-type/white-paper',
              tagID: 'caas:content-type/white-paper',
              name: 'white-paper',
              tagImage: '',
              title: 'White paper',
              'title.de': 'Whitepaper',
              'title.es': 'Informe técnico',
              'title.fr': 'Article technique',
              'title.hi': 'व्हाइट पेपर',
              'title.it': 'White paper',
              'title.nl': 'Rapport',
              'title.th': 'เอกสารประกอบ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'plans-&-pricing': {
              path: '/content/cq:tags/caas/content-type/plans-&-pricing',
              tagID: 'caas:content-type/plans-&-pricing',
              name: 'plans-&-pricing',
              tagImage: '',
              title: 'Plans &amp; Pricing',
              'title.de': 'Abo-Optionen und Preise',
              'title.es': 'Planes y precios',
              'title.fr': 'Formules et tarifs',
              'title.hi': 'प्लान्स और प्राइसिंग',
              'title.it': 'Piani e prezzi',
              'title.nl': 'Lidmaatschappen en prijzen',
              'title.th': 'แพ็กเกจและราคา',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            features: {
              path: '/content/cq:tags/caas/content-type/features',
              tagID: 'caas:content-type/features',
              name: 'features',
              tagImage: '',
              title: 'Features',
              'title.bp': 'Funcionalidades',
              'title.fr': 'Fonctionnalités',
              'title.tw': '功能',
              'title.it': 'Funzionalità',
              'title.se': 'Funktioner',
              'title.esla': 'Funciones',
              'title.kr': '기능',
              'title.cn': '功能',
              'title.de': 'Funktionen',
              'title.es': 'Funciones',
              'title.jp': '機能',
              'title.hi': 'फ़ीचर्स',
              'title.nl': 'Functies',
              'title.th': 'ฟีเจอร์',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'progressive-offer': {
              path: '/content/cq:tags/caas/content-type/progressive-offer',
              tagID: 'caas:content-type/progressive-offer',
              name: 'progressive-offer',
              tagImage: '',
              title: 'Progressive Offer',
              'title.de': 'Progressives Angebot',
              'title.es': 'Oferta progresiva',
              'title.fr': 'Offre progressive',
              'title.hi': 'प्रोग्रेसिव ऑफ़र',
              'title.it': 'Offerta progressiva',
              'title.nl': 'Progressieve aanbieding',
              'title.th': 'ข้อเสนอแบบโปรเกรสซีฟ',
              description: 'This tag is used for DX demand offers that follow a very specific order and cadence. This tag is usually excluded from the Resource Center.',
              'cq:movedTo': '',
              tags: {},
            },
            'financial-services': {
              path: '/content/cq:tags/caas/content-type/financial-services',
              tagID: 'caas:content-type/financial-services',
              name: 'financial-services',
              tagImage: '',
              title: 'Financial Services',
              'title.de': 'Finanzdienstleistungen',
              'title.es': 'Servicios financieros',
              'title.fr': 'Services financiers',
              'title.hi': 'फ़ाइनेंशियल सर्विसेज़',
              'title.it': 'Servizi finanziari',
              'title.nl': 'Financiële dienstverlening',
              'title.th': 'บริการทางการเงิน',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'partner-story': {
              path: '/content/cq:tags/caas/content-type/partner-story',
              tagID: 'caas:content-type/partner-story',
              name: 'partner-story',
              tagImage: '',
              title: 'Partner Story',
              'title.de': 'Partnerreferenz',
              'title.es': 'Historia del partner',
              'title.fr': 'Témoignage partenaire',
              'title.hi': 'पार्टनर स्टोरी',
              'title.it': 'Testimonianza di un partner',
              'title.nl': 'Partnerverhaal',
              'title.th': 'เรื่องราวของพาร์ทเนอร์',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'product-page': {
              path: '/content/cq:tags/caas/content-type/product-page',
              tagID: 'caas:content-type/product-page',
              name: 'product-page',
              tagImage: '',
              title: 'Product Page',
              'title.de': 'Produktseite',
              'title.es': 'Página del producto',
              'title.fr': 'Page produit',
              'title.hi': 'प्रोडक्ट पेज',
              'title.it': 'Pagina di prodotto',
              'title.nl': 'Productpagina',
              'title.th': 'หน้าผลิตภัณฑ์',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'special-offers': {
              path: '/content/cq:tags/caas/content-type/special-offers',
              tagID: 'caas:content-type/special-offers',
              name: 'special-offers',
              tagImage: '',
              title: 'Special Offers',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            technology: {
              path: '/content/cq:tags/caas/content-type/technology',
              tagID: 'caas:content-type/technology',
              name: 'technology',
              tagImage: '',
              title: 'Technology',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            interview: {
              path: '/content/cq:tags/caas/content-type/interview',
              tagID: 'caas:content-type/interview',
              name: 'interview',
              tagImage: '',
              title: 'Interview',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            community: {
              path: '/content/cq:tags/caas/content-type/community',
              tagID: 'caas:content-type/community',
              name: 'community',
              tagImage: '',
              title: 'Community',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            announcements: {
              path: '/content/cq:tags/caas/content-type/announcements',
              tagID: 'caas:content-type/announcements',
              name: 'announcements',
              tagImage: '',
              title: 'Announcements',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            keynote: {
              path: '/content/cq:tags/caas/content-type/keynote',
              tagID: 'caas:content-type/keynote',
              name: 'keynote',
              tagImage: '',
              title: 'Keynote',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'new-releases': {
              path: '/content/cq:tags/caas/content-type/new-releases',
              tagID: 'caas:content-type/new-releases',
              name: 'new-releases',
              tagImage: '',
              title: 'New Releases',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'r&d': {
              path: '/content/cq:tags/caas/content-type/r&d',
              tagID: 'caas:content-type/r&d',
              name: 'r&d',
              tagImage: '',
              title: 'R&amp;D',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'product-updates': {
              path: '/content/cq:tags/caas/content-type/product-updates',
              tagID: 'caas:content-type/product-updates',
              name: 'product-updates',
              tagImage: '',
              title: 'Product Updates',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        cta: {
          path: '/content/cq:tags/caas/cta',
          tagID: 'caas:cta',
          name: 'cta',
          tagImage: '',
          title: 'CTA',
          description: '',
          'cq:movedTo': '',
          tags: {
            'read-now': {
              path: '/content/cq:tags/caas/cta/read-now',
              tagID: 'caas:cta/read-now',
              name: 'read-now',
              tagImage: '',
              title: 'Read now',
              'title.zh_cn': '立即阅读',
              'title.pt': 'Leia agora',
              'title.ar': 'اقرا الان',
              'title.fr': 'Lire',
              'title.ja': '今すぐ読む',
              'title.zh_hk': '立即閱讀',
              'title.zh_tw': '立即閱讀',
              'title.it': 'Leggi',
              'title.ko': '확인하기',
              'title.de': 'Jetzt lesen',
              'title.es': 'Leer ahora',
              'title.hi': 'अभी पढ़ें',
              'title.sv': 'Läs nu',
              'title.nl': 'Nu lezen',
              'title.th': 'อ่านรายงาน',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'get-details': {
              path: '/content/cq:tags/caas/cta/get-details',
              tagID: 'caas:cta/get-details',
              name: 'get-details',
              tagImage: '',
              title: 'Get details',
              'title.zh_cn': '获取详细信息',
              'title.pt': 'Saiba mais',
              'title.fr': 'En savoir plus',
              'title.ja': '詳細を見る',
              'title.zh_hk': '獲取詳情',
              'title.zh_tw': '獲取詳情',
              'title.it': 'Vai ai dettagli',
              'title.ko': '자세히 보기',
              'title.de': 'Mehr erfahren',
              'title.es': 'Obtener detalles',
              'title.sv': 'Mer info',
              'title.nl': 'Meer informatie',
              'title.th': 'ดูรายละเอียด',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'watch-now': {
              path: '/content/cq:tags/caas/cta/watch-now',
              tagID: 'caas:cta/watch-now',
              name: 'watch-now',
              tagImage: '',
              title: 'Watch now',
              'title.de': 'Jetzt ansehen',
              'title.zh_cn': '立即观看',
              'title.es': 'Ver ahora',
              'title.pt': 'Assista agora',
              'title.fr': 'Regarder',
              'title.hi': 'अभी देखें',
              'title.sv': 'Titta nu',
              'title.ja': '今すぐ見る',
              'title.zh_tw': '立即觀看',
              'title.it': 'Guarda',
              'title.ko': '영상 보기',
              'title.nl': 'Nu bekijken',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'take-quiz': {
              path: '/content/cq:tags/caas/cta/take-quiz',
              tagID: 'caas:cta/take-quiz',
              name: 'take-quiz',
              tagImage: '',
              title: 'Take quiz',
              'title.zh_cn': '参加测试',
              'title.pt': 'Fazer o teste',
              'title.fr': 'Répondre au questionnaire',
              'title.ja': 'クイズに答える',
              'title.zh_hk': '參加測驗',
              'title.zh_tw': '參加測驗',
              'title.it': 'Completa il questionario',
              'title.ko': '퀴즈 풀기',
              'title.de': 'Quiz starten',
              'title.es': 'Realizar prueba',
              'title.sv': 'Gör quiz',
              'title.nl': 'Quiz doen',
              'title.th': 'ทำแบบทดสอบ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'listen-now': {
              path: '/content/cq:tags/caas/cta/listen-now',
              tagID: 'caas:cta/listen-now',
              name: 'listen-now',
              tagImage: '',
              title: 'Listen now',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'try-now': {
              path: '/content/cq:tags/caas/cta/try-now',
              tagID: 'caas:cta/try-now',
              name: 'try-now',
              tagImage: '',
              title: 'Try now',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'buy-now': {
              path: '/content/cq:tags/caas/cta/buy-now',
              tagID: 'caas:cta/buy-now',
              name: 'buy-now',
              tagImage: '',
              title: 'Buy now',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'learn-more': {
              path: '/content/cq:tags/caas/cta/learn-more',
              tagID: 'caas:cta/learn-more',
              name: 'learn-more',
              tagImage: '',
              title: 'Learn more',
              'title.ja': '詳しく見る',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'visit-shop': {
              path: '/content/cq:tags/caas/cta/visit-shop',
              tagID: 'caas:cta/visit-shop',
              name: 'visit-shop',
              tagImage: '',
              title: 'Visit shop',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'register-now': {
              path: '/content/cq:tags/caas/cta/register-now',
              tagID: 'caas:cta/register-now',
              name: 'register-now',
              tagImage: '',
              title: 'Register now',
              'title.zh_cn': '立即注册',
              'title.ja': '今すぐ登録',
              'title.zh_tw': '立即註冊',
              'title.ko': '지금 등록',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'download-guide': {
              path: '/content/cq:tags/caas/cta/download-guide',
              tagID: 'caas:cta/download-guide',
              name: 'download-guide',
              tagImage: '',
              title: 'Download guide',
              'title.ja': 'ダウンロード',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'read-article': {
              path: '/content/cq:tags/caas/cta/read-article',
              tagID: 'caas:cta/read-article',
              name: 'read-article',
              tagImage: '',
              title: 'Read article',
              'title.ja': '記事を読む',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'read-report': {
              path: '/content/cq:tags/caas/cta/read-report',
              tagID: 'caas:cta/read-report',
              name: 'read-report',
              tagImage: '',
              title: 'Read report',
              'title.ja': 'レポートを読む',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'grab-your-spot': {
              path: '/content/cq:tags/caas/cta/grab-your-spot',
              tagID: 'caas:cta/grab-your-spot',
              name: 'grab-your-spot',
              tagImage: '',
              title: 'Grab your spot',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'get-offer': {
              path: '/content/cq:tags/caas/cta/get-offer',
              tagID: 'caas:cta/get-offer',
              name: 'get-offer',
              tagImage: '',
              title: 'Get offer',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        badge: {
          path: '/content/cq:tags/caas/badge',
          tagID: 'caas:badge',
          name: 'badge',
          tagImage: '',
          title: 'Badge',
          description: '',
          'cq:movedTo': '',
          tags: {
            featured: {
              path: '/content/cq:tags/caas/badge/featured',
              tagID: 'caas:badge/featured',
              name: 'featured',
              tagImage: '',
              title: 'Featured',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        'card-style': {
          path: '/content/cq:tags/caas/card-style',
          tagID: 'caas:card-style',
          name: 'card-style',
          tagImage: '',
          title: 'Card Style',
          description: '',
          'cq:movedTo': '',
          tags: {
            default: {
              path: '/content/cq:tags/caas/card-style/default',
              tagID: 'caas:card-style/default',
              name: 'default',
              tagImage: '',
              title: 'Default',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'event-session': {
              path: '/content/cq:tags/caas/card-style/event-session',
              tagID: 'caas:card-style/event-session',
              name: 'event-session',
              tagImage: '',
              title: 'Event Session',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'single-tall-image': {
              path: '/content/cq:tags/caas/card-style/single-tall-image',
              tagID: 'caas:card-style/single-tall-image',
              name: 'single-tall-image',
              tagImage: '',
              title: 'Single Tall Image',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'single-image': {
              path: '/content/cq:tags/caas/card-style/single-image',
              tagID: 'caas:card-style/single-image',
              name: 'single-image',
              tagImage: '',
              title: 'Single Image',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'half-height-featured': {
              path: '/content/cq:tags/caas/card-style/half-height-featured',
              tagID: 'caas:card-style/half-height-featured',
              name: 'half-height-featured',
              tagImage: '',
              title: 'Half Height Featured',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        'business-unit': {
          path: '/content/cq:tags/caas/business-unit',
          tagID: 'caas:business-unit',
          name: 'business-unit',
          tagImage: '',
          title: 'Business Unit',
          description: '',
          'cq:movedTo': '',
          tags: {
            'creative-cloud': {
              path: '/content/cq:tags/caas/business-unit/creative-cloud',
              tagID: 'caas:business-unit/creative-cloud',
              name: 'creative-cloud',
              tagImage: '',
              title: 'Creative Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'experience-cloud': {
              path: '/content/cq:tags/caas/business-unit/experience-cloud',
              tagID: 'caas:business-unit/experience-cloud',
              name: 'experience-cloud',
              tagImage: '',
              title: 'Experience Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'document-cloud': {
              path: '/content/cq:tags/caas/business-unit/document-cloud',
              tagID: 'caas:business-unit/document-cloud',
              name: 'document-cloud',
              tagImage: '',
              title: 'Document Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'commerce-cloud': {
              path: '/content/cq:tags/caas/business-unit/commerce-cloud',
              tagID: 'caas:business-unit/commerce-cloud',
              name: 'commerce-cloud',
              tagImage: '',
              title: 'Commerce Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        'journey-phase': {
          path: '/content/cq:tags/caas/journey-phase',
          tagID: 'caas:journey-phase',
          name: 'journey-phase',
          tagImage: '',
          title: 'Journey Phase',
          description: '',
          'cq:movedTo': '',
          tags: {
            discover: {
              path: '/content/cq:tags/caas/journey-phase/discover',
              tagID: 'caas:journey-phase/discover',
              name: 'discover',
              tagImage: '',
              title: 'Discover',
              'title.de': 'Entdeckung',
              'title.zh_cn': '发现',
              'title.es': 'Descubrir',
              'title.pt': 'Descobrir',
              'title.fr': 'Découvrir',
              'title.sv': 'Upptäckt',
              'title.ja': '発見',
              'title.zh_tw': '發現',
              'title.it': 'Scoperta',
              'title.ko': '발견',
              'title.nl': 'Ontdekken',
              'title.th': 'ค้นพบ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            explore: {
              path: '/content/cq:tags/caas/journey-phase/explore',
              tagID: 'caas:journey-phase/explore',
              name: 'explore',
              tagImage: '',
              title: 'Explore',
              'title.de': 'Erkundung',
              'title.zh_cn': '探索',
              'title.es': 'Explorar',
              'title.pt': 'Explorar',
              'title.fr': 'Explorer',
              'title.sv': 'Utforskning',
              'title.ja': '探索',
              'title.zh_tw': '探索',
              'title.it': 'Approfondimento',
              'title.ko': '탐색',
              'title.nl': 'Verkennen',
              'title.th': 'สำรวจ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            evaluate: {
              path: '/content/cq:tags/caas/journey-phase/evaluate',
              tagID: 'caas:journey-phase/evaluate',
              name: 'evaluate',
              tagImage: '',
              title: 'Evaluate',
              'title.de': 'Bewertung',
              'title.zh_cn': '评估',
              'title.es': 'Evaluar',
              'title.pt': 'Avaliação',
              'title.fr': 'Évaluation',
              'title.sv': 'Utvärdering',
              'title.ja': '評価',
              'title.zh_tw': '評估',
              'title.it': 'Valutazione',
              'title.ko': '평가',
              'title.nl': 'Evalueren',
              'title.th': 'ประเมิน',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'use-re-invest': {
              path: '/content/cq:tags/caas/journey-phase/use-re-invest',
              tagID: 'caas:journey-phase/use-re-invest',
              name: 'use-re-invest',
              tagImage: '',
              title: 'Use Re-invest',
              'title.de': 'Nutzung/Neuinvestition',
              'title.zh_cn': '使用/重复投资',
              'title.es': 'Usar/reinvertir',
              'title.pt': 'Uso/reinvestimento',
              'title.fr': 'Utilisation/Réinvestissement',
              'title.sv': 'Användning/återinvestering',
              'title.ja': '利用／再投資',
              'title.zh_tw': '使用/再投資',
              'title.it': 'Utilizzo/Reinvestimento',
              'title.ko': '활용/재투자',
              'title.nl': 'Gebruik/herinvestering',
              'title.th': 'ใช้/ลงทุนอีกครั้ง',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            acquisition: {
              path: '/content/cq:tags/caas/journey-phase/acquisition',
              tagID: 'caas:journey-phase/acquisition',
              name: 'acquisition',
              tagImage: '',
              title: 'Acquisition',
              'title.de': 'Akquise',
              'title.zh_cn': '获取',
              'title.es': 'Adquisición',
              'title.pt': 'Aquisição',
              'title.fr': 'Acquisition',
              'title.sv': 'Förvärv',
              'title.ja': '獲得',
              'title.zh_tw': '獲取',
              'title.it': 'Acquisizione',
              'title.ko': '확보',
              'title.nl': 'Acquisitie',
              'title.th': 'การได้ลูกค้าใหม่',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            acceleration: {
              path: '/content/cq:tags/caas/journey-phase/acceleration',
              tagID: 'caas:journey-phase/acceleration',
              name: 'acceleration',
              tagImage: '',
              title: 'Acceleration',
              'title.de': 'Beschleunigung',
              'title.zh_cn': '加速',
              'title.es': 'Aceleración',
              'title.pt': 'Aceleração',
              'title.fr': 'Accélération',
              'title.sv': 'Acceleration',
              'title.ja': '加速',
              'title.zh_tw': '加速',
              'title.it': 'Accelerazione',
              'title.ko': '가속화',
              'title.nl': 'Versnelling',
              'title.th': 'การเร่ง',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            expansion: {
              path: '/content/cq:tags/caas/journey-phase/expansion',
              tagID: 'caas:journey-phase/expansion',
              name: 'expansion',
              tagImage: '',
              title: 'Expansion',
              'title.de': 'Expansion',
              'title.zh_cn': '扩展',
              'title.es': 'Expansión',
              'title.pt': 'Expansão',
              'title.fr': 'Expansion',
              'title.sv': 'Expansion',
              'title.ja': '拡大',
              'title.zh_tw': '擴充',
              'title.it': 'Espansione',
              'title.ko': '확장',
              'title.nl': 'Uitbreiding',
              'title.th': 'การขยาย',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            retention: {
              path: '/content/cq:tags/caas/journey-phase/retention',
              tagID: 'caas:journey-phase/retention',
              name: 'retention',
              tagImage: '',
              title: 'Retention',
              'title.de': 'Bindung',
              'title.zh_cn': '保留',
              'title.es': 'Retención',
              'title.pt': 'Retenção',
              'title.fr': 'Fidélisation',
              'title.sv': 'Kundlojalitet',
              'title.ja': '維持',
              'title.zh_tw': '保留',
              'title.it': 'Fidelizzazione',
              'title.ko': '유지',
              'title.nl': 'Retentie',
              'title.th': 'การรักษาลูกค้า',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        role: {
          path: '/content/cq:tags/caas/role',
          tagID: 'caas:role',
          name: 'role',
          tagImage: '',
          title: 'Role',
          'title.ja': '役職',
          description: '',
          'cq:movedTo': '',
          tags: {
            it: {
              path: '/content/cq:tags/caas/role/it',
              tagID: 'caas:role/it',
              name: 'it',
              tagImage: '',
              title: 'IT',
              'title.de': 'IT',
              'title.zh_cn': 'IT',
              'title.es': 'TI',
              'title.pt': 'TI',
              'title.fr': 'IT',
              'title.sv': 'IT',
              'title.ja': 'IT',
              'title.zh_tw': 'IT',
              'title.it': 'IT',
              'title.ko': 'IT',
              'title.nl': 'IT',
              'title.th': 'ฝ่ายไอที',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            marketing: {
              path: '/content/cq:tags/caas/role/marketing',
              tagID: 'caas:role/marketing',
              name: 'marketing',
              tagImage: '',
              title: 'Marketing',
              'title.de': 'Marketing',
              'title.zh_cn': '营销',
              'title.es': 'Marketing',
              'title.pt': 'Marketing',
              'title.fr': 'Marketing',
              'title.sv': 'Marknadsföring',
              'title.ja': 'マーケティング',
              'title.zh_tw': '行銷',
              'title.it': 'Marketing',
              'title.ko': '마케팅',
              'title.nl': 'Marketing',
              'title.th': 'ฝ่ายการตลาด',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            advertising: {
              path: '/content/cq:tags/caas/role/advertising',
              tagID: 'caas:role/advertising',
              name: 'advertising',
              tagImage: '',
              title: 'Advertising',
              'title.de': 'Werbung',
              'title.zh_cn': '广告',
              'title.es': 'Publicidad',
              'title.pt': 'Publicidade',
              'title.fr': 'Publicité',
              'title.sv': 'Reklam',
              'title.ja': '広告',
              'title.zh_tw': '廣告',
              'title.it': 'Pubblicità',
              'title.ko': '광고',
              'title.nl': 'Reclame',
              'title.th': 'ฝ่ายโฆษณา',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            digital: {
              path: '/content/cq:tags/caas/role/digital',
              tagID: 'caas:role/digital',
              name: 'digital',
              tagImage: '',
              title: 'Digital',
              'title.de': 'Digital',
              'title.zh_cn': '数字',
              'title.es': 'Digital',
              'title.pt': 'Digital',
              'title.fr': 'Digital',
              'title.sv': 'Digitalt',
              'title.ja': 'デジタル',
              'title.zh_tw': '數位',
              'title.it': 'Digitale',
              'title.ko': '디지털',
              'title.nl': 'Digitaal',
              'title.th': 'ฝ่ายดิจิทัล',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'vision-leader': {
              path: '/content/cq:tags/caas/role/vision-leader',
              tagID: 'caas:role/vision-leader',
              name: 'vision-leader',
              tagImage: '',
              title: 'Vision Leader',
              'title.de': 'Vordenker',
              'title.zh_cn': '愿景领导者',
              'title.es': 'Líder de concepto',
              'title.pt': 'Líder de visão',
              'title.fr': 'Stratège',
              'title.sv': 'Visionsledarskap',
              'title.ja': 'ビジョンリーダー',
              'title.zh_tw': '願景領導',
              'title.it': 'Responsabile della visione aziendale',
              'title.ko': '비전 리더',
              'title.nl': 'Visieleider',
              'title.th': 'ผู้นำด้านวิสัยทัศน์',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'decision-maker': {
              path: '/content/cq:tags/caas/role/decision-maker',
              tagID: 'caas:role/decision-maker',
              name: 'decision-maker',
              tagImage: '',
              title: 'Decision Maker',
              'title.de': 'Entscheidungsträger',
              'title.zh_cn': '决策者',
              'title.es': 'Responsable de la toma de decisiones',
              'title.pt': 'Tomador de decisões',
              'title.fr': 'Décideur',
              'title.sv': 'Beslutsfattande',
              'title.ja': '意思決定者',
              'title.zh_tw': '決策者',
              'title.it': 'Responsabile decisionale',
              'title.ko': '의사 결정자',
              'title.nl': 'Besluitvormer',
              'title.th': 'ผู้ตัดสินใจ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'feature-evaluator': {
              path: '/content/cq:tags/caas/role/feature-evaluator',
              tagID: 'caas:role/feature-evaluator',
              name: 'feature-evaluator',
              tagImage: '',
              title: 'Feature Evaluator',
              'title.de': 'Funktionsbewerter',
              'title.zh_cn': '功能评估者',
              'title.es': 'Evaluador de funciones',
              'title.pt': 'Avaliador de recursos',
              'title.fr': 'Analyste fonctionnel',
              'title.sv': 'Funktionsutvärdering',
              'title.ja': '機能評価者',
              'title.zh_tw': '功能評估員',
              'title.it': 'Valutatore di funzionalità',
              'title.ko': '기능 평가자',
              'title.nl': 'Functie-evaluator',
              'title.th': 'ผู้ประเมินคุณสมบัติ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'compliance-evaluator': {
              path: '/content/cq:tags/caas/role/compliance-evaluator',
              tagID: 'caas:role/compliance-evaluator',
              name: 'compliance-evaluator',
              tagImage: '',
              title: 'Compliance Evaluator',
              'title.de': 'Compliance-Bewerter',
              'title.zh_cn': '合规性评估者',
              'title.es': 'Evaluador de cumplimiento normativo',
              'title.pt': 'Avaliador de conformidade',
              'title.fr': 'Analyste conformité',
              'title.sv': 'Regelefterlevnad',
              'title.ja': 'コンプライアンス評価者',
              'title.zh_tw': '合規評估員',
              'title.it': 'Valutatore di conformità',
              'title.ko': '규정 준수 평가자',
              'title.nl': 'Compliance-evaluator',
              'title.th': 'ผู้ประเมินการปฏิบัติตามข้อกำหนด',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            commerce: {
              path: '/content/cq:tags/caas/role/commerce',
              tagID: 'caas:role/commerce',
              name: 'commerce',
              tagImage: '',
              title: 'Commerce',
              'title.de': 'Commerce',
              'title.zh_cn': '商务',
              'title.es': 'Comercio',
              'title.pt': 'E-commerce',
              'title.fr': 'Commerce',
              'title.sv': 'Handel',
              'title.ja': 'コマース',
              'title.zh_tw': '商務',
              'title.it': 'E-commerce',
              'title.ko': '커머스',
              'title.nl': 'Commerce',
              'title.th': 'ฝ่ายการค้า',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            sales: {
              path: '/content/cq:tags/caas/role/sales',
              tagID: 'caas:role/sales',
              name: 'sales',
              tagImage: '',
              title: 'Sales',
              'title.de': 'Vertrieb',
              'title.zh_cn': '销售',
              'title.es': 'Ventas',
              'title.pt': 'Vendas',
              'title.fr': 'Ventes',
              'title.sv': 'Försäljning',
              'title.ja': '営業',
              'title.zh_tw': '銷售',
              'title.it': 'Vendite',
              'title.ko': '세일즈',
              'title.nl': 'Verkoop',
              'title.th': 'ฝ่ายขายขาย',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        industry: {
          path: '/content/cq:tags/caas/industry',
          tagID: 'caas:industry',
          name: 'industry',
          tagImage: '',
          title: 'Industry',
          'title.zh_cn': '行业',
          'title.pt': 'Setor',
          'title.fr': 'Secteur',
          'title.ja': '業種',
          'title.zh_tw': '產業',
          'title.it': 'Settore',
          'title.ko': '업계',
          'title.de': 'Branche',
          'title.es': 'Sector',
          'title.hi': 'इंडस्ट्री',
          'title.sv': 'Bransch',
          'title.nl': 'Sector',
          'title.th': 'อุตสาหกรรม',
          description: '',
          'cq:movedTo': '',
          tags: {
            'financial-services': {
              path: '/content/cq:tags/caas/industry/financial-services',
              tagID: 'caas:industry/financial-services',
              name: 'financial-services',
              tagImage: '',
              title: 'Financial Services',
              'title.zh_cn': '金融服务业',
              'title.pt': 'Serviços financeiros',
              'title.fr': 'Services financiers',
              'title.ja': '金融',
              'title.zh_tw': '金融服務業',
              'title.it': 'Servizi finanziari',
              'title.ko': '금융 서비스',
              'title.de': 'Finanzdienstleistungen',
              'title.es': 'Servicios financieros',
              'title.hi': 'फ़ाइनेंशियल सर्विसेज़',
              'title.sv': 'Finansiella tjänster',
              'title.nl': 'Financiële dienstverlening',
              'title.th': 'บริการทางการเงิน',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'media-and-entertainment': {
              path: '/content/cq:tags/caas/industry/media-and-entertainment',
              tagID: 'caas:industry/media-and-entertainment',
              name: 'media-and-entertainment',
              tagImage: '',
              title: 'Media &amp; Entertainment',
              'title.zh_cn': '媒体和娱乐业',
              'title.pt': 'Mídia e entretenimento',
              'title.fr': 'Médias et divertissement',
              'title.ja': 'メディア＆エンターテインメント',
              'title.zh_tw': '媒體與娛樂業',
              'title.it': 'Media e intrattenimento',
              'title.ko': '미디어 및 엔터테인먼트',
              'title.de': 'Medien und Unterhaltung',
              'title.es': 'Medios y entretenimiento',
              'title.hi': 'मीडिया और एंटरटेनमेंट',
              'title.sv': 'Media och underhållning',
              'title.nl': 'Media- en amusementssector',
              'title.th': 'สื่อและความบันเทิง',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            retail: {
              path: '/content/cq:tags/caas/industry/retail',
              tagID: 'caas:industry/retail',
              name: 'retail',
              tagImage: '',
              title: 'Retail',
              'title.zh_cn': '零售业',
              'title.pt': 'Varejo ',
              'title.fr': 'Grande distribution',
              'title.ja': '小売',
              'title.zh_tw': '零售業',
              'title.it': 'Vendita al dettaglio',
              'title.ko': '리테일',
              'title.de': 'Einzelhandel',
              'title.es': 'Ventas',
              'title.hi': 'रिटेल',
              'title.sv': 'Detaljhandeln',
              'title.nl': 'Retail',
              'title.th': 'การค้าปลีก',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'travel-and-hospitality': {
              path: '/content/cq:tags/caas/industry/travel-and-hospitality',
              tagID: 'caas:industry/travel-and-hospitality',
              name: 'travel-and-hospitality',
              tagImage: '',
              title: 'Travel &amp; Hospitality',
              'title.zh_cn': '旅游和酒店业',
              'title.pt': 'Viagens e hospitalidade',
              'title.fr': 'Tourisme et hôtellerie',
              'title.ja': '旅行＆観光',
              'title.zh_tw': '旅行與接待',
              'title.it': 'Viaggi e ospitalità',
              'title.ko': '여행 및 숙박',
              'title.de': 'Touristik und Gastgewerbe',
              'title.es': 'Viajes y hotelería',
              'title.hi': 'ट्रेवल एवं हॉस्पिटेलिटी',
              'title.sv': 'Hotell- och restaurang',
              'title.nl': 'Reis- en horecabranche',
              'title.th': 'การเดินทางและการบริการ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            healthcare: {
              path: '/content/cq:tags/caas/industry/healthcare',
              tagID: 'caas:industry/healthcare',
              name: 'healthcare',
              tagImage: '',
              title: 'Healthcare',
              'title.de': 'Gesundheitswesen',
              'title.zh_cn': '医疗保健业',
              'title.es': 'Servicios de asistencia sanitaria',
              'title.pt': 'serviços de saúde',
              'title.fr': 'Santé',
              'title.hi': 'हेल्थकेयर',
              'title.sv': 'Sjukvård',
              'title.ja': '医療',
              'title.zh_tw': '醫療保健業',
              'title.it': 'Sanità',
              'title.ko': '의료',
              'title.nl': 'Gezondheidszorg',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            government: {
              path: '/content/cq:tags/caas/industry/government',
              tagID: 'caas:industry/government',
              name: 'government',
              tagImage: '',
              title: 'Government',
              'title.zh_cn': '政府类',
              'title.pt': 'órgãos governamentais',
              'title.fr': 'Administration',
              'title.ja': '官公庁／公的機関',
              'title.zh_tw': '政府機關',
              'title.it': 'Settore',
              'title.ko': '공공 기관',
              'title.de': 'Behörden',
              'title.es': 'Organismos públicos',
              'title.hi': 'गवर्नमेंट',
              'title.sv': 'Myndigheter',
              'title.nl': 'Overheid',
              'title.th': 'ภาครัฐ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            telecommunications: {
              path: '/content/cq:tags/caas/industry/telecommunications',
              tagID: 'caas:industry/telecommunications',
              name: 'telecommunications',
              tagImage: '',
              title: 'Telecommunications',
              'title.zh_cn': '电信业',
              'title.pt': 'Telecomunicações ',
              'title.fr': 'Télécommunications',
              'title.ja': '通信',
              'title.zh_tw': '電信業',
              'title.it': 'Telecomunicazioni ',
              'title.ko': '통신',
              'title.de': 'Telekommunikation',
              'title.es': 'Telecomunicaciones',
              'title.hi': 'टेलीकॉम्यूनिकेशन्स',
              'title.sv': 'Telekommunikation',
              'title.nl': 'Telecommunicatie',
              'title.th': 'โทรคมนาคม',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            education: {
              path: '/content/cq:tags/caas/industry/education',
              tagID: 'caas:industry/education',
              name: 'education',
              tagImage: '',
              title: 'Education',
              'title.zh_cn': '教育',
              'title.pt': 'Instituições de ensino',
              'title.fr': 'Éducation',
              'title.ja': '教育',
              'title.zh_tw': '教育',
              'title.it': 'Istruzione',
              'title.ko': '교육 기관',
              'title.de': 'Bildung',
              'title.es': 'Educación',
              'title.hi': 'एजुकेशन',
              'title.sv': 'Utbildning',
              'title.nl': 'Onderwijs',
              'title.th': 'การศึกษา',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            manufacturing: {
              path: '/content/cq:tags/caas/industry/manufacturing',
              tagID: 'caas:industry/manufacturing',
              name: 'manufacturing',
              tagImage: '',
              title: 'Manufacturing',
              'title.zh_cn': '制造',
              'title.pt': 'Manufatura',
              'title.fr': 'Industrie',
              'title.ja': '製造',
              'title.zh_tw': '製造',
              'title.it': 'Industria manifatturiera',
              'title.ko': '제조',
              'title.de': 'Fertigung',
              'title.es': 'Fabricación',
              'title.hi': 'मैन्यूफ़ैक्चरिंग',
              'title.sv': 'Tillverkning',
              'title.nl': 'Maakindustrie',
              'title.th': 'การผลิต',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'high-tech': {
              path: '/content/cq:tags/caas/industry/high-tech',
              tagID: 'caas:industry/high-tech',
              name: 'high-tech',
              tagImage: '',
              title: 'High Tech',
              'title.zh_cn': '高科技行业',
              'title.pt': 'Alta tecnologia',
              'title.fr': 'Hautes technologies',
              'title.ja': 'ハイテク',
              'title.zh_tw': '高科技',
              'title.it': 'High tech',
              'title.ko': '첨단 기술',
              'title.de': 'Hightech',
              'title.es': 'Alta tecnología',
              'title.hi': 'हाई टेक',
              'title.sv': 'Högteknologi',
              'title.nl': 'Hightech',
              'title.th': 'ไฮเทค',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'non-profit': {
              path: '/content/cq:tags/caas/industry/non-profit',
              tagID: 'caas:industry/non-profit',
              name: 'non-profit',
              tagImage: '',
              title: 'Non-profit',
              'title.zh_cn': '非赢利性机构',
              'title.pt': 'Organizações sem fins lucrativos',
              'title.fr': 'Organisme à but non lucratif',
              'title.ja': '非営利団体',
              'title.zh_tw': '非營利',
              'title.it': 'Non-profit',
              'title.ko': '비영리 단체',
              'title.de': 'Gemeinnützige Organisationen',
              'title.es': 'Organizaciones sin ánimo de lucro',
              'title.hi': 'नॉन-प्रॉफ़िट',
              'title.sv': 'Ideella organisationer',
              'title.nl': 'Non-profit',
              'title.th': 'ไม่แสวงผลกำไร',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'food-and-beverage': {
              path: '/content/cq:tags/caas/industry/food-and-beverage',
              tagID: 'caas:industry/food-and-beverage',
              name: 'food-and-beverage',
              tagImage: '',
              title: 'Food &amp; Beverage',
              'title.zh_cn': '食品饮料',
              'title.pt': 'Alimentos e bebidas',
              'title.fr': 'Restauration',
              'title.ja': '食品＆飲料',
              'title.zh_tw': '食品飲料',
              'title.it': 'Prodotti alimentari e bevande',
              'title.ko': '식음료',
              'title.de': 'Lebensmittel und Getränke',
              'title.es': 'Alimentos y bebidas',
              'title.hi': 'फ़ूड और बीवरेज',
              'title.sv': 'Livsmedel',
              'title.nl': 'Voedingsmiddelen en dranken',
              'title.th': 'อาหารและเครื่องดื่ม',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'life-sciences': {
              path: '/content/cq:tags/caas/industry/life-sciences',
              tagID: 'caas:industry/life-sciences',
              name: 'life-sciences',
              tagImage: '',
              title: 'Life Sciences',
              'title.zh_cn': '生命科学',
              'title.pt': 'Ciências da vida',
              'title.fr': 'Sciences de la vie',
              'title.ja': '生命科学',
              'title.zh_tw': '生命科學',
              'title.it': 'Scienze naturali',
              'title.ko': '생명 과학',
              'title.de': 'Life Sciences',
              'title.es': 'Ciencias de la vida',
              'title.hi': 'लाइफ़ साइंसेज़',
              'title.sv': 'Biovetenskap',
              'title.nl': 'Levenswetenschappen',
              'title.th': 'วิทยาศาสตร์เพื่อชีวิต',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            aviation: {
              path: '/content/cq:tags/caas/industry/aviation',
              tagID: 'caas:industry/aviation',
              name: 'aviation',
              tagImage: '',
              title: 'Aviation',
              'title.ja': '航空',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            advertising: {
              path: '/content/cq:tags/caas/industry/advertising',
              tagID: 'caas:industry/advertising',
              name: 'advertising',
              tagImage: '',
              title: 'Advertising',
              'title.sv_se': 'Annonsering',
              'title.zh_cn': '广告',
              'title.ko_kr': '광고',
              'title.pt': 'Publicidade',
              'title.nl_nl': 'Reclame',
              'title.fr': 'publicité',
              'title.ja': '広告',
              'title.zh_hk': '廣告',
              'title.zh_tw': '廣告',
              'title.it': 'Pubblicità',
              'title.de': 'Werbung',
              'title.es': 'Publicidad',
              'title.th': 'การโฆษณา',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'energy-utilities': {
              path: '/content/cq:tags/caas/industry/energy-utilities',
              tagID: 'caas:industry/energy-utilities',
              name: 'energy-utilities',
              tagImage: '',
              title: 'Energy &amp; Utilities',
              'title.ja': 'エネルギー&ユーティリティ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'logistics-transportation': {
              path: '/content/cq:tags/caas/industry/logistics-transportation',
              tagID: 'caas:industry/logistics-transportation',
              name: 'logistics-transportation',
              tagImage: '',
              title: 'Logistics &amp; Transportation',
              'title.ja': '物流&輸送',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'print-publishing': {
              path: '/content/cq:tags/caas/industry/print-publishing',
              tagID: 'caas:industry/print-publishing',
              name: 'print-publishing',
              tagImage: '',
              title: 'Print &amp; Publishing',
              'title.ja': '印刷&出版',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            pharmaceuticals: {
              path: '/content/cq:tags/caas/industry/pharmaceuticals',
              tagID: 'caas:industry/pharmaceuticals',
              name: 'pharmaceuticals',
              tagImage: '',
              title: 'Pharmaceuticals',
              'title.ja': '製薬',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'professional-services': {
              path: '/content/cq:tags/caas/industry/professional-services',
              tagID: 'caas:industry/professional-services',
              name: 'professional-services',
              tagImage: '',
              title: 'Professional Services',
              'title.ja': '専門技術',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'technology-software-services': {
              path: '/content/cq:tags/caas/industry/technology-software-services',
              tagID: 'caas:industry/technology-software-services',
              name: 'technology-software-services',
              tagImage: '',
              title: 'Technology Software &amp; Services',
              'title.ja': 'ソフトウェア&サービス',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'automotive-&-mobility': {
              path: '/content/cq:tags/caas/industry/automotive-&-mobility',
              tagID: 'caas:industry/automotive-&-mobility',
              name: 'automotive-&-mobility',
              tagImage: '',
              title: 'Automotive &amp; Mobility',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'consumer-goods': {
              path: '/content/cq:tags/caas/industry/consumer-goods',
              tagID: 'caas:industry/consumer-goods',
              name: 'consumer-goods',
              tagImage: '',
              title: 'Consumer Goods',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'industrial-manufacturing': {
              path: '/content/cq:tags/caas/industry/industrial-manufacturing',
              tagID: 'caas:industry/industrial-manufacturing',
              name: 'industrial-manufacturing',
              tagImage: '',
              title: 'Industrial Manufacturing',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            other: {
              path: '/content/cq:tags/caas/industry/other',
              tagID: 'caas:industry/other',
              name: 'other',
              tagImage: '',
              title: 'Other',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'real-estate': {
              path: '/content/cq:tags/caas/industry/real-estate',
              tagID: 'caas:industry/real-estate',
              name: 'real-estate',
              tagImage: '',
              title: 'Real-Estate',
              'title.ja': '不動産',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            construction: {
              path: '/content/cq:tags/caas/industry/construction',
              tagID: 'caas:industry/construction',
              name: 'construction',
              tagImage: '',
              title: 'Construction',
              'title.ja': '建設',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            gaming: {
              path: '/content/cq:tags/caas/industry/gaming',
              tagID: 'caas:industry/gaming',
              name: 'gaming',
              tagImage: '',
              title: 'Gaming',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            film: {
              path: '/content/cq:tags/caas/industry/film',
              tagID: 'caas:industry/film',
              name: 'film',
              tagImage: '',
              title: 'Film',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            recreation: {
              path: '/content/cq:tags/caas/industry/recreation',
              tagID: 'caas:industry/recreation',
              name: 'recreation',
              tagImage: '',
              title: 'Recreation',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            architecture: {
              path: '/content/cq:tags/caas/industry/architecture',
              tagID: 'caas:industry/architecture',
              name: 'architecture',
              tagImage: '',
              title: 'Architecture',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'interior-design': {
              path: '/content/cq:tags/caas/industry/interior-design',
              tagID: 'caas:industry/interior-design',
              name: 'interior-design',
              tagImage: '',
              title: 'Interior Design',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            simulation: {
              path: '/content/cq:tags/caas/industry/simulation',
              tagID: 'caas:industry/simulation',
              name: 'simulation',
              tagImage: '',
              title: 'Simulation',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'virtual-worlds': {
              path: '/content/cq:tags/caas/industry/virtual-worlds',
              tagID: 'caas:industry/virtual-worlds',
              name: 'virtual-worlds',
              tagImage: '',
              title: 'Virtual Worlds',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'motion-design': {
              path: '/content/cq:tags/caas/industry/motion-design',
              tagID: 'caas:industry/motion-design',
              name: 'motion-design',
              tagImage: '',
              title: 'Motion Design',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'product-design': {
              path: '/content/cq:tags/caas/industry/product-design',
              tagID: 'caas:industry/product-design',
              name: 'product-design',
              tagImage: '',
              title: 'Product Design',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'packaging-design': {
              path: '/content/cq:tags/caas/industry/packaging-design',
              tagID: 'caas:industry/packaging-design',
              name: 'packaging-design',
              tagImage: '',
              title: 'Packaging Design',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            marketing: {
              path: '/content/cq:tags/caas/industry/marketing',
              tagID: 'caas:industry/marketing',
              name: 'marketing',
              tagImage: '',
              title: 'Marketing',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'fashion-design': {
              path: '/content/cq:tags/caas/industry/fashion-design',
              tagID: 'caas:industry/fashion-design',
              name: 'fashion-design',
              tagImage: '',
              title: 'Fashion Design',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'public-sector': {
              path: '/content/cq:tags/caas/industry/public-sector',
              tagID: 'caas:industry/public-sector',
              name: 'public-sector',
              tagImage: '',
              title: 'Public Sector',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        events: {
          path: '/content/cq:tags/caas/events',
          tagID: 'caas:events',
          name: 'events',
          tagImage: '',
          title: 'Events',
          description: '',
          'cq:movedTo': '',
          tags: {
            'session-type': {
              path: '/content/cq:tags/caas/events/session-type',
              tagID: 'caas:events/session-type',
              name: 'session-type',
              tagImage: '',
              title: 'Session Type',
              description: '',
              'cq:movedTo': '',
              tags: {
                'adobe-live': {
                  path: '/content/cq:tags/caas/events/session-type/adobe-live',
                  tagID: 'caas:events/session-type/adobe-live',
                  name: 'adobe-live',
                  tagImage: '',
                  title: 'Adobe Live',
                  'title.ja': 'Adobe Live',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                evangelist: {
                  path: '/content/cq:tags/caas/events/session-type/evangelist',
                  tagID: 'caas:events/session-type/evangelist',
                  name: 'evangelist',
                  tagImage: '',
                  title: 'Evangelist',
                  'title.de': 'Evangelist',
                  'title.fr': 'Spécialiste',
                  'title.ja': 'エバンジェリスト',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                networking: {
                  path: '/content/cq:tags/caas/events/session-type/networking',
                  tagID: 'caas:events/session-type/networking',
                  name: 'networking',
                  tagImage: '',
                  title: 'Networking',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'special-guest': {
                  path: '/content/cq:tags/caas/events/session-type/special-guest',
                  tagID: 'caas:events/session-type/special-guest',
                  name: 'special-guest',
                  tagImage: '',
                  title: 'Special Guest',
                  'title.de': 'Ehrengast',
                  'title.fr': 'Invité de marque',
                  'title.ja': 'スペシャルゲスト',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'creativity-workshop': {
                  path: '/content/cq:tags/caas/events/session-type/creativity-workshop',
                  tagID: 'caas:events/session-type/creativity-workshop',
                  name: 'creativity-workshop',
                  tagImage: '',
                  title: 'Creativity Workshop',
                  'title.de': 'Creativity Workshop',
                  'title.fr': 'Atelier Créativité',
                  'title.ja': 'クリエイティビティワークショップ',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                lab: {
                  path: '/content/cq:tags/caas/events/session-type/lab',
                  tagID: 'caas:events/session-type/lab',
                  name: 'lab',
                  tagImage: '',
                  title: 'Lab',
                  'title.de': 'Lab',
                  'title.fr': 'Laboratoire',
                  'title.ja': 'ラボ',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                luminary: {
                  path: '/content/cq:tags/caas/events/session-type/luminary',
                  tagID: 'caas:events/session-type/luminary',
                  name: 'luminary',
                  tagImage: '',
                  title: 'Luminary',
                  'title.de': 'KoryphÃ¤e',
                  'title.fr': 'Expert',
                  'title.ja': 'スタークリエイター',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                session: {
                  path: '/content/cq:tags/caas/events/session-type/session',
                  tagID: 'caas:events/session-type/session',
                  name: 'session',
                  tagImage: '',
                  title: 'Session',
                  'title.de': 'Session',
                  'title.fr': 'Session',
                  'title.ja': 'セッション',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                keynote: {
                  path: '/content/cq:tags/caas/events/session-type/keynote',
                  tagID: 'caas:events/session-type/keynote',
                  name: 'keynote',
                  tagImage: '',
                  title: 'Keynote',
                  'title.de': 'Keynote',
                  'title.fr': 'Keynote',
                  'title.ja': 'キーノート ',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'max-chats': {
                  path: '/content/cq:tags/caas/events/session-type/max-chats',
                  tagID: 'caas:events/session-type/max-chats',
                  name: 'max-chats',
                  tagImage: '',
                  title: 'MAX Chats',
                  'title.de': 'MAX Chats',
                  'title.fr': 'Dialogues en direct MAX',
                  'title.ja': 'MAX Chats',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'birds-of-a-feather': {
                  path: '/content/cq:tags/caas/events/session-type/birds-of-a-feather',
                  tagID: 'caas:events/session-type/birds-of-a-feather',
                  name: 'birds-of-a-feather',
                  tagImage: '',
                  title: 'Birds of a Feather',
                  'title.de': 'Birds of a Feather',
                  'title.fr': 'Échanges informels',
                  'title.ja': 'テーマ別討論',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'meet-the-teams': {
                  path: '/content/cq:tags/caas/events/session-type/meet-the-teams',
                  tagID: 'caas:events/session-type/meet-the-teams',
                  name: 'meet-the-teams',
                  tagImage: '',
                  title: 'Meet the Teams',
                  'title.de': 'Meet the Teams',
                  'title.fr': 'Rencontre des équipes',
                  'title.ja': 'チーム紹介',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                skills: {
                  path: '/content/cq:tags/caas/events/session-type/skills',
                  tagID: 'caas:events/session-type/skills',
                  name: 'skills',
                  tagImage: '',
                  title: 'Skills',
                  'title.de': 'Kenntnisse',
                  'title.fr': 'Compétences',
                  'title.ja': 'スキル',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                tips: {
                  path: '/content/cq:tags/caas/events/session-type/tips',
                  tagID: 'caas:events/session-type/tips',
                  name: 'tips',
                  tagImage: '',
                  title: 'Tips',
                  'title.de': 'Tipps',
                  'title.fr': 'Conseils',
                  'title.ja': 'ヒント',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'art-walks': {
                  path: '/content/cq:tags/caas/events/session-type/art-walks',
                  tagID: 'caas:events/session-type/art-walks',
                  name: 'art-walks',
                  tagImage: '',
                  title: 'Art Walks',
                  'title.de': 'Art Walks',
                  'title.fr': 'Balades artistiques',
                  'title.ja': 'アートウォーク',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'creative-challenges': {
                  path: '/content/cq:tags/caas/events/session-type/creative-challenges',
                  tagID: 'caas:events/session-type/creative-challenges',
                  name: 'creative-challenges',
                  tagImage: '',
                  title: 'Creative Challenges',
                  'title.de': 'Creative Challenges ',
                  'title.fr': 'Défis créatifs ',
                  'title.ja': 'クリエイティブチャレンジ',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'chill-out': {
                  path: '/content/cq:tags/caas/events/session-type/chill-out',
                  tagID: 'caas:events/session-type/chill-out',
                  name: 'chill-out',
                  tagImage: '',
                  title: 'Chill Out',
                  'title.de': 'Chill Out',
                  'title.fr': 'Lâcher-prise',
                  'title.ja': 'クールダウン',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'try-this-at-home': {
                  path: '/content/cq:tags/caas/events/session-type/try-this-at-home',
                  tagID: 'caas:events/session-type/try-this-at-home',
                  name: 'try-this-at-home',
                  tagImage: '',
                  title: 'Try This at Home',
                  'title.de': 'Try This At Home',
                  'title.fr': 'À tester chez vous',
                  'title.ja': '自宅で挑戦',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'creature-features': {
                  path: '/content/cq:tags/caas/events/session-type/creature-features',
                  tagID: 'caas:events/session-type/creature-features',
                  name: 'creature-features',
                  tagImage: '',
                  title: 'Creature Features',
                  'title.de': 'Creature Features',
                  'title.fr': 'Génie animal',
                  'title.ja': '生き物の特性',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'training-workshop': {
                  path: '/content/cq:tags/caas/events/session-type/training-workshop',
                  tagID: 'caas:events/session-type/training-workshop',
                  name: 'training-workshop',
                  tagImage: '',
                  title: 'Training Workshop',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'innovation-super-session': {
                  path: '/content/cq:tags/caas/events/session-type/innovation-super-session',
                  tagID: 'caas:events/session-type/innovation-super-session',
                  name: 'innovation-super-session',
                  tagImage: '',
                  title: 'Innovation Super Session',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'office-hours': {
                  path: '/content/cq:tags/caas/events/session-type/office-hours',
                  tagID: 'caas:events/session-type/office-hours',
                  name: 'office-hours',
                  tagImage: '',
                  title: 'Live Q&amp;A with Adobe Experts',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                sneaks: {
                  path: '/content/cq:tags/caas/events/session-type/sneaks',
                  tagID: 'caas:events/session-type/sneaks',
                  name: 'sneaks',
                  tagImage: '',
                  title: 'Sneaks',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'keynotes-sneaks': {
                  path: '/content/cq:tags/caas/events/session-type/keynotes-sneaks',
                  tagID: 'caas:events/session-type/keynotes-sneaks',
                  name: 'keynotes-sneaks',
                  tagImage: '',
                  title: 'Keynotes &amp; Sneaks',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'first-take': {
                  path: '/content/cq:tags/caas/events/session-type/first-take',
                  tagID: 'caas:events/session-type/first-take',
                  name: 'first-take',
                  tagImage: '',
                  title: 'First Take',
                  'title.de': 'First Take',
                  'title.fr': 'First Take',
                  'title.ja': 'ファーストテイク',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'meet-the-speaker': {
                  path: '/content/cq:tags/caas/events/session-type/meet-the-speaker',
                  tagID: 'caas:events/session-type/meet-the-speaker',
                  name: 'meet-the-speaker',
                  tagImage: '',
                  title: 'Meet the Speaker',
                  'title.ja': 'スピーカーの紹介',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'meet-the-adobe-teams': {
                  path: '/content/cq:tags/caas/events/session-type/meet-the-adobe-teams',
                  tagID: 'caas:events/session-type/meet-the-adobe-teams',
                  name: 'meet-the-adobe-teams',
                  tagImage: '',
                  title: 'Meet the Adobe Teams',
                  'title.ja': 'アドビチームの紹介',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'ask-the-experts': {
                  path: '/content/cq:tags/caas/events/session-type/ask-the-experts',
                  tagID: 'caas:events/session-type/ask-the-experts',
                  name: 'ask-the-experts',
                  tagImage: '',
                  title: 'Ask the experts',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'live-broadcast': {
                  path: '/content/cq:tags/caas/events/session-type/live-broadcast',
                  tagID: 'caas:events/session-type/live-broadcast',
                  name: 'live-broadcast',
                  tagImage: '',
                  title: 'Mainstage Broadcast',
                  'title.de': 'Mainstage Broadcast',
                  'title.fr': 'Mainstage Broadcast',
                  'title.ja': 'メインステージ配信',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                virtual: {
                  path: '/content/cq:tags/caas/events/session-type/virtual',
                  tagID: 'caas:events/session-type/virtual',
                  name: 'virtual',
                  tagImage: '',
                  title: 'Virtual',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'preconference-lab': {
                  path: '/content/cq:tags/caas/events/session-type/preconference-lab',
                  tagID: 'caas:events/session-type/preconference-lab',
                  name: 'preconference-lab',
                  tagImage: '',
                  title: 'Preconference Lab',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'in-person-on-demand': {
                  path: '/content/cq:tags/caas/events/session-type/in-person-on-demand',
                  tagID: 'caas:events/session-type/in-person-on-demand',
                  name: 'in-person-on-demand',
                  tagImage: '',
                  title: 'In-person &amp; On-demand Sessions',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'creative-super-session': {
                  path: '/content/cq:tags/caas/events/session-type/creative-super-session',
                  tagID: 'caas:events/session-type/creative-super-session',
                  name: 'creative-super-session',
                  tagImage: '',
                  title: 'Creative Super Session',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'luminary-session': {
                  path: '/content/cq:tags/caas/events/session-type/luminary-session',
                  tagID: 'caas:events/session-type/luminary-session',
                  name: 'luminary-session',
                  tagImage: '',
                  title: 'Luminary Session',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                photowalk: {
                  path: '/content/cq:tags/caas/events/session-type/photowalk',
                  tagID: 'caas:events/session-type/photowalk',
                  name: 'photowalk',
                  tagImage: '',
                  title: 'Photowalk',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'strategy-keynote': {
                  path: '/content/cq:tags/caas/events/session-type/strategy-keynote',
                  tagID: 'caas:events/session-type/strategy-keynote',
                  name: 'strategy-keynote',
                  tagImage: '',
                  title: 'Strategy Keynote',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            max: {
              path: '/content/cq:tags/caas/events/max',
              tagID: 'caas:events/max',
              name: 'max',
              tagImage: '',
              title: 'MAX',
              description: '',
              'cq:movedTo': '',
              tags: {
                'primary-poi': {
                  path: '/content/cq:tags/caas/events/max/primary-poi',
                  tagID: 'caas:events/max/primary-poi',
                  name: 'primary-poi',
                  tagImage: '',
                  title: 'Primary POI',
                  'title.ja': '主な見どころ',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    access: {
                      path: '/content/cq:tags/caas/events/max/primary-poi/access',
                      tagID: 'caas:events/max/primary-poi/access',
                      name: 'access',
                      tagImage: '',
                      title: 'Access',
                      'title.ja': '参加方法',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'acrobat-professional': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/acrobat-professional',
                      tagID: 'caas:events/max/primary-poi/acrobat-professional',
                      name: 'acrobat-professional',
                      tagImage: '',
                      title: 'Acrobat Professional',
                      'title.ja': 'Acrobat Professional',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'adobe-stock': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/adobe-stock',
                      tagID: 'caas:events/max/primary-poi/adobe-stock',
                      name: 'adobe-stock',
                      tagImage: '',
                      title: 'Adobe Stock',
                      'title.ja': 'Adobe Stock',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'after-effects-standard': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/after-effects-standard',
                      tagID: 'caas:events/max/primary-poi/after-effects-standard',
                      name: 'after-effects-standard',
                      tagImage: '',
                      title: 'After Effects Standard',
                      'title.ja': 'After Effects Standard',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    auditude: {
                      path: '/content/cq:tags/caas/events/max/primary-poi/auditude',
                      tagID: 'caas:events/max/primary-poi/auditude',
                      name: 'auditude',
                      tagImage: '',
                      title: 'Auditude',
                      'title.ja': 'Auditude',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'creative-suite': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/creative-suite',
                      tagID: 'caas:events/max/primary-poi/creative-suite',
                      name: 'creative-suite',
                      tagImage: '',
                      title: 'Creative Suite',
                      'title.ja': 'Creative Suite',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'design-standard': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/design-standard',
                      tagID: 'caas:events/max/primary-poi/design-standard',
                      name: 'design-standard',
                      tagImage: '',
                      title: 'Design Standard',
                      'title.ja': 'Design Standard',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    dreamweaver: {
                      path: '/content/cq:tags/caas/events/max/primary-poi/dreamweaver',
                      tagID: 'caas:events/max/primary-poi/dreamweaver',
                      name: 'dreamweaver',
                      tagImage: '',
                      title: 'Dreamweaver',
                      'title.ja': 'Dreamweaver',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    flash: {
                      path: '/content/cq:tags/caas/events/max/primary-poi/flash',
                      tagID: 'caas:events/max/primary-poi/flash',
                      name: 'flash',
                      tagImage: '',
                      title: 'Flash',
                      'title.ja': 'Flash',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    freehand: {
                      path: '/content/cq:tags/caas/events/max/primary-poi/freehand',
                      tagID: 'caas:events/max/primary-poi/freehand',
                      name: 'freehand',
                      tagImage: '',
                      title: 'Freehand',
                      'title.ja': 'Freehand',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    indesign: {
                      path: '/content/cq:tags/caas/events/max/primary-poi/indesign',
                      tagID: 'caas:events/max/primary-poi/indesign',
                      name: 'indesign',
                      tagImage: '',
                      title: 'InDesign',
                      'title.ja': 'InDesign',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    insight: {
                      path: '/content/cq:tags/caas/events/max/primary-poi/insight',
                      tagID: 'caas:events/max/primary-poi/insight',
                      name: 'insight',
                      tagImage: '',
                      title: 'Insight',
                      'title.ja': 'Insight',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    photoshop: {
                      path: '/content/cq:tags/caas/events/max/primary-poi/photoshop',
                      tagID: 'caas:events/max/primary-poi/photoshop',
                      name: 'photoshop',
                      tagImage: '',
                      title: 'Photoshop',
                      'title.ja': 'Photoshop',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'photoshop-extended': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/photoshop-extended',
                      tagID: 'caas:events/max/primary-poi/photoshop-extended',
                      name: 'photoshop-extended',
                      tagImage: '',
                      title: 'Photoshop Extended',
                      'title.ja': 'Photoshop Extended',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'premiere-elements': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/premiere-elements',
                      tagID: 'caas:events/max/primary-poi/premiere-elements',
                      name: 'premiere-elements',
                      tagImage: '',
                      title: 'Premiere Elements',
                      'title.ja': 'Premiere Elements',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'production-premium': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/production-premium',
                      tagID: 'caas:events/max/primary-poi/production-premium',
                      name: 'production-premium',
                      tagImage: '',
                      title: 'Production Premium',
                      'title.ja': 'Production Premium',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    acrobat: {
                      path: '/content/cq:tags/caas/events/max/primary-poi/acrobat',
                      tagID: 'caas:events/max/primary-poi/acrobat',
                      name: 'acrobat',
                      tagImage: '',
                      title: 'Acrobat',
                      'title.ja': 'Acrobat',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'adobe-media-server': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/adobe-media-server',
                      tagID: 'caas:events/max/primary-poi/adobe-media-server',
                      name: 'adobe-media-server',
                      tagImage: '',
                      title: 'Adobe Media Server',
                      'title.ja': 'Adobe Media Server',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'after-effects-pro': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/after-effects-pro',
                      tagID: 'caas:events/max/primary-poi/after-effects-pro',
                      name: 'after-effects-pro',
                      tagImage: '',
                      title: 'After Effects Pro',
                      'title.ja': 'After Effects Pro',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    audition: {
                      path: '/content/cq:tags/caas/events/max/primary-poi/audition',
                      tagID: 'caas:events/max/primary-poi/audition',
                      name: 'audition',
                      tagImage: '',
                      title: 'Audition',
                      'title.ja': 'Audition',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'creative-cloud': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/creative-cloud',
                      tagID: 'caas:events/max/primary-poi/creative-cloud',
                      name: 'creative-cloud',
                      tagImage: '',
                      title: 'Creative Cloud',
                      'title.ja': 'Creative Cloud',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'design-premium': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/design-premium',
                      tagID: 'caas:events/max/primary-poi/design-premium',
                      name: 'design-premium',
                      tagImage: '',
                      title: 'Design Premium',
                      'title.ja': 'Design Premium',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    director: {
                      path: '/content/cq:tags/caas/events/max/primary-poi/director',
                      tagID: 'caas:events/max/primary-poi/director',
                      name: 'director',
                      tagImage: '',
                      title: 'Director',
                      'title.ja': 'Director',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    encore: {
                      path: '/content/cq:tags/caas/events/max/primary-poi/encore',
                      tagID: 'caas:events/max/primary-poi/encore',
                      name: 'encore',
                      tagImage: '',
                      title: 'Encore',
                      'title.ja': 'Encore',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'flex-builder': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/flex-builder',
                      tagID: 'caas:events/max/primary-poi/flex-builder',
                      name: 'flex-builder',
                      tagImage: '',
                      title: 'Flex Builder',
                      'title.ja': 'Flex Builder',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    illustrator: {
                      path: '/content/cq:tags/caas/events/max/primary-poi/illustrator',
                      tagID: 'caas:events/max/primary-poi/illustrator',
                      name: 'illustrator',
                      tagImage: '',
                      title: 'Illustrator',
                      'title.ja': 'Illustrator',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'indesign-server': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/indesign-server',
                      tagID: 'caas:events/max/primary-poi/indesign-server',
                      name: 'indesign-server',
                      tagImage: '',
                      title: 'InDesign Server',
                      'title.ja': 'InDesign Server',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'master-collection': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/master-collection',
                      tagID: 'caas:events/max/primary-poi/master-collection',
                      name: 'master-collection',
                      tagImage: '',
                      title: 'Master Collection',
                      'title.ja': 'Master Collection',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'photoshop-elements': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/photoshop-elements',
                      tagID: 'caas:events/max/primary-poi/photoshop-elements',
                      name: 'photoshop-elements',
                      tagImage: '',
                      title: 'Photoshop Elements',
                      'title.ja': 'Photoshop Elements',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'photoshop-lightroom': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/photoshop-lightroom',
                      tagID: 'caas:events/max/primary-poi/photoshop-lightroom',
                      name: 'photoshop-lightroom',
                      tagImage: '',
                      title: 'Photoshop Lightroom',
                      'title.ja': 'Photoshop Lightroom',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'premiere-pro': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/premiere-pro',
                      tagID: 'caas:events/max/primary-poi/premiere-pro',
                      name: 'premiere-pro',
                      tagImage: '',
                      title: 'Premiere Pro',
                      'title.ja': 'Premiere Pro',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'web-premium': {
                      path: '/content/cq:tags/caas/events/max/primary-poi/web-premium',
                      tagID: 'caas:events/max/primary-poi/web-premium',
                      name: 'web-premium',
                      tagImage: '',
                      title: 'Web Premium',
                      'title.ja': 'Web Premium',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                'technical-level': {
                  path: '/content/cq:tags/caas/events/max/technical-level',
                  tagID: 'caas:events/max/technical-level',
                  name: 'technical-level',
                  tagImage: '',
                  title: 'Technical Level',
                  'title.ja': '難易度',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    intermediate: {
                      path: '/content/cq:tags/caas/events/max/technical-level/intermediate',
                      tagID: 'caas:events/max/technical-level/intermediate',
                      name: 'intermediate',
                      tagImage: '',
                      title: 'Intermediate',
                      'title.de': 'Aufsteiger',
                      'title.fr': 'Intermédiaire',
                      'title.ja': '中級',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'general-audience': {
                      path: '/content/cq:tags/caas/events/max/technical-level/general-audience',
                      tagID: 'caas:events/max/technical-level/general-audience',
                      name: 'general-audience',
                      tagImage: '',
                      title: 'General Audience',
                      'title.de': 'Allgemeines Publikum',
                      'title.fr': 'Grand public',
                      'title.ja': '一般',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    beginner: {
                      path: '/content/cq:tags/caas/events/max/technical-level/beginner',
                      tagID: 'caas:events/max/technical-level/beginner',
                      name: 'beginner',
                      tagImage: '',
                      title: 'Beginner',
                      'title.de': 'Einsteiger',
                      'title.fr': 'Débutant',
                      'title.ja': '初級',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    advanced: {
                      path: '/content/cq:tags/caas/events/max/technical-level/advanced',
                      tagID: 'caas:events/max/technical-level/advanced',
                      name: 'advanced',
                      tagImage: '',
                      title: 'Advanced',
                      'title.de': 'Fortgeschrittene',
                      'title.fr': 'Avancé',
                      'title.ja': '上級',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                track: {
                  path: '/content/cq:tags/caas/events/max/track',
                  tagID: 'caas:events/max/track',
                  name: 'track',
                  tagImage: '',
                  title: 'Track',
                  'title.ja': 'トラック',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    video: {
                      path: '/content/cq:tags/caas/events/max/track/video',
                      tagID: 'caas:events/max/track/video',
                      name: 'video',
                      tagImage: '',
                      title: 'Video',
                      'title.de': 'Video',
                      'title.fr': 'Vidéo',
                      'title.ja': '動画',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'social-media': {
                      path: '/content/cq:tags/caas/events/max/track/social-media',
                      tagID: 'caas:events/max/track/social-media',
                      name: 'social-media',
                      tagImage: '',
                      title: 'Social Media',
                      'title.de': 'Social Media',
                      'title.fr': 'Réseaux sociaux',
                      'title.ja': 'ソーシャルメディア',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    education: {
                      path: '/content/cq:tags/caas/events/max/track/education',
                      tagID: 'caas:events/max/track/education',
                      name: 'education',
                      tagImage: '',
                      title: 'Education',
                      'title.de': 'Aus- & Weiterbildung',
                      'title.fr': 'Enseignement',
                      'title.ja': '教育',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'business-productivity': {
                      path: '/content/cq:tags/caas/events/max/track/business-productivity',
                      tagID: 'caas:events/max/track/business-productivity',
                      name: 'business-productivity',
                      tagImage: '',
                      title: 'Business Productivity',
                      'title.de': 'Produktivität im Unternehmen',
                      'title.fr': 'Productivité commerciale',
                      'title.ja': 'ビジネスの生産性',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'illustration-and-digital-painting': {
                      path: '/content/cq:tags/caas/events/max/track/illustration-and-digital-painting',
                      tagID: 'caas:events/max/track/illustration-and-digital-painting',
                      name: 'illustration-and-digital-painting',
                      tagImage: '',
                      title: 'Illustration and Digital Painting',
                      'title.de': 'Illustration, digitales Malen & Zeichnen',
                      'title.fr': 'Peinture numérique et illustration',
                      'title.ja': 'イラストとデジタルペイント',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    photography: {
                      path: '/content/cq:tags/caas/events/max/track/photography',
                      tagID: 'caas:events/max/track/photography',
                      name: 'photography',
                      tagImage: '',
                      title: 'Photography',
                      'title.de': 'Fotografie',
                      'title.fr': 'Photographie',
                      'title.ja': '写真',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'graphic-design': {
                      path: '/content/cq:tags/caas/events/max/track/graphic-design',
                      tagID: 'caas:events/max/track/graphic-design',
                      name: 'graphic-design',
                      tagImage: '',
                      title: 'Graphic Design',
                      'title.de': 'Grafikdesign',
                      'title.fr': 'Design graphique',
                      'title.ja': 'グラフィックデザイン',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'ui-and-ux': {
                      path: '/content/cq:tags/caas/events/max/track/ui-and-ux',
                      tagID: 'caas:events/max/track/ui-and-ux',
                      name: 'ui-and-ux',
                      tagImage: '',
                      title: 'UI and UX',
                      'title.de': 'UI & UX',
                      'title.fr': 'UI et UX',
                      'title.ja': 'UI & UX',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    '3d-and-ar': {
                      path: '/content/cq:tags/caas/events/max/track/3d-and-ar',
                      tagID: 'caas:events/max/track/3d-and-ar',
                      name: '3d-and-ar',
                      tagImage: '',
                      title: '3D and AR',
                      'title.de': '3D & AR',
                      'title.fr': '3D & AR',
                      'title.ja': '3D & AR',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'creativity-and-design-in-business': {
                      path: '/content/cq:tags/caas/events/max/track/creativity-and-design-in-business',
                      tagID: 'caas:events/max/track/creativity-and-design-in-business',
                      name: 'creativity-and-design-in-business',
                      tagImage: '',
                      title: 'Creativity and Design in Business',
                      'title.de': 'Foto, Video & Design in Unternehmen',
                      'title.fr': 'Créativité et design au service de l’entreprise',
                      'title.ja': 'ビジネスにおけるクリエイティビティ',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'collaboration-and-productivity': {
                      path: '/content/cq:tags/caas/events/max/track/collaboration-and-productivity',
                      tagID: 'caas:events/max/track/collaboration-and-productivity',
                      name: 'collaboration-and-productivity',
                      tagImage: '',
                      title: 'Collaboration and Productivity',
                      'title.ja': 'コラボレーションと生産性',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'live-broadcast': {
                      path: '/content/cq:tags/caas/events/max/track/live-broadcast',
                      tagID: 'caas:events/max/track/live-broadcast',
                      name: 'live-broadcast',
                      tagImage: '',
                      title: 'Live Broadcast',
                      'title.ja': 'ライブ配信',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'meet-the-adobe-teams': {
                      path: '/content/cq:tags/caas/events/max/track/meet-the-adobe-teams',
                      tagID: 'caas:events/max/track/meet-the-adobe-teams',
                      name: 'meet-the-adobe-teams',
                      tagImage: '',
                      title: 'Meet the Adobe Teams',
                      'title.ja': 'アドビチームの紹介',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    productivity: {
                      path: '/content/cq:tags/caas/events/max/track/productivity',
                      tagID: 'caas:events/max/track/productivity',
                      name: 'productivity',
                      tagImage: '',
                      title: 'Productivity',
                      'title.ja': '生産性向上',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    collaboration: {
                      path: '/content/cq:tags/caas/events/max/track/collaboration',
                      tagID: 'caas:events/max/track/collaboration',
                      name: 'collaboration',
                      tagImage: '',
                      title: 'Collaboration',
                      'title.ja': '共同作業',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'drawing-painting-and-illustration': {
                      path: '/content/cq:tags/caas/events/max/track/drawing-painting-and-illustration',
                      tagID: 'caas:events/max/track/drawing-painting-and-illustration',
                      name: 'drawing-painting-and-illustration',
                      tagImage: '',
                      title: 'Drawing, Painting, and Illustration',
                      'title.ja': '描画、ペイント、イラスト',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'social-media-and-marketing': {
                      path: '/content/cq:tags/caas/events/max/track/social-media-and-marketing',
                      tagID: 'caas:events/max/track/social-media-and-marketing',
                      name: 'social-media-and-marketing',
                      tagImage: '',
                      title: 'Social Media and Marketing',
                      'title.ja': 'ソーシャルメディアとマーケティング',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'video-audio-and-motion': {
                      path: '/content/cq:tags/caas/events/max/track/video-audio-and-motion',
                      tagID: 'caas:events/max/track/video-audio-and-motion',
                      name: 'video-audio-and-motion',
                      tagImage: '',
                      title: 'Video, Audio, and Motion',
                      'title.ja': 'ビデオ、オーディオ、モーション',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    '3d': {
                      path: '/content/cq:tags/caas/events/max/track/3d',
                      tagID: 'caas:events/max/track/3d',
                      name: '3d',
                      tagImage: '',
                      title: '3D',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                'big-tent': {
                  path: '/content/cq:tags/caas/events/max/big-tent',
                  tagID: 'caas:events/max/big-tent',
                  name: 'big-tent',
                  tagImage: '',
                  title: 'Big Tent',
                  'title.ja': 'Big Tent',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'on-demand': {
                      path: '/content/cq:tags/caas/events/max/big-tent/on-demand',
                      tagID: 'caas:events/max/big-tent/on-demand',
                      name: 'on-demand',
                      tagImage: '',
                      title: 'On-Demand',
                      'title.de': 'On-Demand',
                      'title.fr': 'À LA DEMANDE',
                      'title.ja': 'オンデマンド',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    live: {
                      path: '/content/cq:tags/caas/events/max/big-tent/live',
                      tagID: 'caas:events/max/big-tent/live',
                      name: 'live',
                      tagImage: '',
                      title: 'Live',
                      'title.de': 'LIVE',
                      'title.fr': 'EN DIRECT',
                      'title.ja': 'ライブ',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                category: {
                  path: '/content/cq:tags/caas/events/max/category',
                  tagID: 'caas:events/max/category',
                  name: 'category',
                  tagImage: '',
                  title: 'Category',
                  'title.ja': 'カテゴリー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'how-to': {
                      path: '/content/cq:tags/caas/events/max/category/how-to',
                      tagID: 'caas:events/max/category/how-to',
                      name: 'how-to',
                      tagImage: '',
                      title: 'How To',
                      'title.de': 'How To',
                      'title.fr': 'Exercices pratiques',
                      'title.ja': 'ハウツー',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'industry-best-practices': {
                      path: '/content/cq:tags/caas/events/max/category/industry-best-practices',
                      tagID: 'caas:events/max/category/industry-best-practices',
                      name: 'industry-best-practices',
                      tagImage: '',
                      title: 'Industry Best Practices',
                      'title.de': 'Industry Best Practices',
                      'title.fr': 'Bonnes pratiques sectorielles',
                      'title.ja': '業界のベストプラクティス',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'creativity-in-the-classroom': {
                      path: '/content/cq:tags/caas/events/max/category/creativity-in-the-classroom',
                      tagID: 'caas:events/max/category/creativity-in-the-classroom',
                      name: 'creativity-in-the-classroom',
                      tagImage: '',
                      title: 'Creativity In The Classroom',
                      'title.de': 'Creativity In The Classroom',
                      'title.fr': 'Créativité en classe',
                      'title.ja': '教育におけるクリエイティビティ',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    mobile: {
                      path: '/content/cq:tags/caas/events/max/category/mobile',
                      tagID: 'caas:events/max/category/mobile',
                      name: 'mobile',
                      tagImage: '',
                      title: 'Mobile',
                      'title.de': 'Mobile',
                      'title.fr': 'Appareils mobiles',
                      'title.ja': 'モバイル',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'running-your-business': {
                      path: '/content/cq:tags/caas/events/max/category/running-your-business',
                      tagID: 'caas:events/max/category/running-your-business',
                      name: 'running-your-business',
                      tagImage: '',
                      title: 'Running Your Business',
                      'title.de': 'Running Your Business',
                      'title.fr': "Gestion d'entreprise",
                      'title.ja': 'ビジネスの継続性',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    inspiration: {
                      path: '/content/cq:tags/caas/events/max/category/inspiration',
                      tagID: 'caas:events/max/category/inspiration',
                      name: 'inspiration',
                      tagImage: '',
                      title: 'Inspiration',
                      'title.de': 'Inspiration',
                      'title.fr': 'Inspiration',
                      'title.ja': 'インスピレーション',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'thought-leadership': {
                      path: '/content/cq:tags/caas/events/max/category/thought-leadership',
                      tagID: 'caas:events/max/category/thought-leadership',
                      name: 'thought-leadership',
                      tagImage: '',
                      title: 'Thought Leadership',
                      'title.de': 'Thought Leadership',
                      'title.fr': 'Leadership éclairé',
                      'title.ja': 'ソートリーダーシップ',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'distance-learning': {
                      path: '/content/cq:tags/caas/events/max/category/distance-learning',
                      tagID: 'caas:events/max/category/distance-learning',
                      name: 'distance-learning',
                      tagImage: '',
                      title: 'Distance Learning',
                      'title.de': 'Distance Learning',
                      'title.fr': 'Télé-enseignement',
                      'title.ja': '遠隔教育',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'remote-work': {
                      path: '/content/cq:tags/caas/events/max/category/remote-work',
                      tagID: 'caas:events/max/category/remote-work',
                      name: 'remote-work',
                      tagImage: '',
                      title: 'Remote Work',
                      'title.de': 'Remote Work',
                      'title.fr': 'Télétravail',
                      'title.ja': 'テレワーク',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'collaborating-with-your-team': {
                      path: '/content/cq:tags/caas/events/max/category/collaborating-with-your-team',
                      tagID: 'caas:events/max/category/collaborating-with-your-team',
                      name: 'collaborating-with-your-team',
                      tagImage: '',
                      title: 'Collaborating with Your Team',
                      'title.ja': 'チームメンバーとのコラボレーション',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    luminary: {
                      path: '/content/cq:tags/caas/events/max/category/luminary',
                      tagID: 'caas:events/max/category/luminary',
                      name: 'luminary',
                      tagImage: '',
                      title: 'Luminary',
                      'title.ja': '著名人',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'generative-ai': {
                      path: '/content/cq:tags/caas/events/max/category/generative-ai',
                      tagID: 'caas:events/max/category/generative-ai',
                      name: 'generative-ai',
                      tagImage: '',
                      title: 'Generative AI',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                'speaker-craft': {
                  path: '/content/cq:tags/caas/events/max/speaker-craft',
                  tagID: 'caas:events/max/speaker-craft',
                  name: 'speaker-craft',
                  tagImage: '',
                  title: 'Speaker Craft',
                  'title.de': 'Kompetenz des/der Vortragenden',
                  'title.fr': 'Spécialité de l’intervenant',
                  'title.ja': '得意分野',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    animation: {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/animation',
                      tagID: 'caas:events/max/speaker-craft/animation',
                      name: 'animation',
                      tagImage: '',
                      title: 'Animation',
                      'title.de': 'Animation',
                      'title.fr': 'Animation',
                      'title.ja': 'アニメーション',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'creative-imaging': {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/creative-imaging',
                      tagID: 'caas:events/max/speaker-craft/creative-imaging',
                      name: 'creative-imaging',
                      tagImage: '',
                      title: 'Creative Imaging',
                      'title.de': 'Creative Imaging',
                      'title.fr': 'Imagerie',
                      'title.ja': 'クリエイティブイメージング',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    illustration: {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/illustration',
                      tagID: 'caas:events/max/speaker-craft/illustration',
                      name: 'illustration',
                      tagImage: '',
                      title: 'Illustration',
                      'title.de': 'Illustration',
                      'title.fr': 'Illustration',
                      'title.ja': 'イラスト',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    photography: {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/photography',
                      tagID: 'caas:events/max/speaker-craft/photography',
                      name: 'photography',
                      tagImage: '',
                      title: 'Photography',
                      'title.de': 'Fotografie',
                      'title.fr': 'Photographie',
                      'title.ja': '写真',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    layout: {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/layout',
                      tagID: 'caas:events/max/speaker-craft/layout',
                      name: 'layout',
                      tagImage: '',
                      title: 'Layout',
                      'title.de': 'Layout',
                      'title.fr': 'Mise en page',
                      'title.ja': 'レイアウト',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'visual-effects': {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/visual-effects',
                      tagID: 'caas:events/max/speaker-craft/visual-effects',
                      name: 'visual-effects',
                      tagImage: '',
                      title: 'Visual Effects',
                      'title.de': 'Visuelle Effekte',
                      'title.fr': 'Effets spéciaux',
                      'title.ja': 'ビジュアルエフェクト',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'ui-and-ux-design': {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/ui-and-ux-design',
                      tagID: 'caas:events/max/speaker-craft/ui-and-ux-design',
                      name: 'ui-and-ux-design',
                      tagImage: '',
                      title: 'UI and UX Design',
                      'title.de': 'UI- & UX-Design',
                      'title.fr': 'UI/UX design',
                      'title.ja': 'UI & UX',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    '3d-and-immersive': {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/3d-and-immersive',
                      tagID: 'caas:events/max/speaker-craft/3d-and-immersive',
                      name: '3d-and-immersive',
                      tagImage: '',
                      title: '3D and Immersive',
                      'title.de': '3d & Immersive',
                      'title.fr': 'Design 3D et immersif',
                      'title.ja': '3D／イマーシブ',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    audio: {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/audio',
                      tagID: 'caas:events/max/speaker-craft/audio',
                      name: 'audio',
                      tagImage: '',
                      title: 'Audio',
                      'title.de': 'Audio',
                      'title.fr': 'Audio',
                      'title.ja': 'オーディオ',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'graphic-design': {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/graphic-design',
                      tagID: 'caas:events/max/speaker-craft/graphic-design',
                      name: 'graphic-design',
                      tagImage: '',
                      title: 'Graphic Design',
                      'title.de': 'Graphik-Design',
                      'title.fr': 'Design graphique',
                      'title.ja': 'グラフィックデザイン',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'motion-graphics': {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/motion-graphics',
                      tagID: 'caas:events/max/speaker-craft/motion-graphics',
                      name: 'motion-graphics',
                      tagImage: '',
                      title: 'Motion Graphics',
                      'title.de': 'Motion Graphics',
                      'title.fr': 'Animation graphique',
                      'title.ja': 'モーショングラフィック',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'print-design': {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/print-design',
                      tagID: 'caas:events/max/speaker-craft/print-design',
                      name: 'print-design',
                      tagImage: '',
                      title: 'Print Design',
                      'title.de': 'Druckdesign',
                      'title.fr': "Création pour l'impression",
                      'title.ja': '印刷物デザイン',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'thought-leadership': {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/thought-leadership',
                      tagID: 'caas:events/max/speaker-craft/thought-leadership',
                      name: 'thought-leadership',
                      tagImage: '',
                      title: 'Thought Leadership',
                      'title.de': 'Thought Leadership',
                      'title.fr': 'Leadership éclairé',
                      'title.ja': 'ソートリーダーシップ',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'video-editing': {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/video-editing',
                      tagID: 'caas:events/max/speaker-craft/video-editing',
                      name: 'video-editing',
                      tagImage: '',
                      title: 'Video Editing',
                      'title.de': 'Videobearbeitung',
                      'title.fr': 'Montage vidéo',
                      'title.ja': '動画編集',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'web-design': {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/web-design',
                      tagID: 'caas:events/max/speaker-craft/web-design',
                      name: 'web-design',
                      tagImage: '',
                      title: 'Web Design',
                      'title.de': 'Webdesign',
                      'title.fr': 'Webdesign',
                      'title.ja': 'webデザイン',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'motion-design': {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/motion-design',
                      tagID: 'caas:events/max/speaker-craft/motion-design',
                      name: 'motion-design',
                      tagImage: '',
                      title: 'Motion Design',
                      'title.ja': 'モーションデザイン',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    '3d': {
                      path: '/content/cq:tags/caas/events/max/speaker-craft/3d',
                      tagID: 'caas:events/max/speaker-craft/3d',
                      name: '3d',
                      tagImage: '',
                      title: '3D',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                shop: {
                  path: '/content/cq:tags/caas/events/max/shop',
                  tagID: 'caas:events/max/shop',
                  name: 'shop',
                  tagImage: '',
                  title: 'Shop Merchandise',
                  'title.de': 'Produkte zum Verkauf',
                  'title.fr': 'Articles de magasin',
                  'title.ja': '販売商品',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'patches-pins-stickers': {
                      path: '/content/cq:tags/caas/events/max/shop/patches-pins-stickers',
                      tagID: 'caas:events/max/shop/patches-pins-stickers',
                      name: 'patches-pins-stickers',
                      tagImage: '',
                      title: 'Patches, Pins, Stickers',
                      'title.de': 'Patches, Pins, Sticker',
                      'title.fr': 'Écussons, pin’s, stickers',
                      'title.ja': 'パッチ、ピンバッチ、ステッカー',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    apparel: {
                      path: '/content/cq:tags/caas/events/max/shop/apparel',
                      tagID: 'caas:events/max/shop/apparel',
                      name: 'apparel',
                      tagImage: '',
                      title: 'Apparel',
                      'title.de': 'Kleidung',
                      'title.fr': 'Vêtements',
                      'title.ja': 'アパレル',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'books-journals': {
                      path: '/content/cq:tags/caas/events/max/shop/books-journals',
                      tagID: 'caas:events/max/shop/books-journals',
                      name: 'books-journals',
                      tagImage: '',
                      title: 'Books and Journals',
                      'title.de': 'Bücher & Zeitschriften',
                      'title.fr': 'Livres et revues',
                      'title.ja': '書籍と刊行物',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'cards-stationery': {
                      path: '/content/cq:tags/caas/events/max/shop/cards-stationery',
                      tagID: 'caas:events/max/shop/cards-stationery',
                      name: 'cards-stationery',
                      tagImage: '',
                      title: 'Cards &amp; Stationery',
                      'title.de': 'Karten & Schreibwaren',
                      'title.fr': 'Cartes et articles de papeterie',
                      'title.ja': 'カードとステーショナリー',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'home-decor': {
                      path: '/content/cq:tags/caas/events/max/shop/home-decor',
                      tagID: 'caas:events/max/shop/home-decor',
                      name: 'home-decor',
                      tagImage: '',
                      title: 'Home Decor',
                      'title.de': 'Innendekoration',
                      'title.fr': 'Décoration d’intérieur',
                      'title.ja': 'ホームデコレーション',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'online-courses-tutorials': {
                      path: '/content/cq:tags/caas/events/max/shop/online-courses-tutorials',
                      tagID: 'caas:events/max/shop/online-courses-tutorials',
                      name: 'online-courses-tutorials',
                      tagImage: '',
                      title: 'Online courses &amp; Tutorials',
                      'title.de': 'Onlinekurse & Tutorials',
                      'title.fr': 'Tutoriels et cours en ligne',
                      'title.ja': 'オンラインコースとチュートリアル',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    totes: {
                      path: '/content/cq:tags/caas/events/max/shop/totes',
                      tagID: 'caas:events/max/shop/totes',
                      name: 'totes',
                      tagImage: '',
                      title: 'Totes',
                      'title.de': 'Taschen',
                      'title.fr': 'Tote bags',
                      'title.ja': 'トートバッグ',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    speaker: {
                      path: '/content/cq:tags/caas/events/max/shop/speaker',
                      tagID: 'caas:events/max/shop/speaker',
                      name: 'speaker',
                      tagImage: '',
                      title: 'Speaker',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    prints: {
                      path: '/content/cq:tags/caas/events/max/shop/prints',
                      tagID: 'caas:events/max/shop/prints',
                      name: 'prints',
                      tagImage: '',
                      title: 'Prints and Posters',
                      'title.de': 'Drucke & Poster',
                      'title.fr': 'Reproductions et affiches',
                      'title.ja': 'プリントとポスター',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    puzzles: {
                      path: '/content/cq:tags/caas/events/max/shop/puzzles',
                      tagID: 'caas:events/max/shop/puzzles',
                      name: 'puzzles',
                      tagImage: '',
                      title: 'Puzzles and Games',
                      'title.de': 'Puzzles & Spiele',
                      'title.fr': 'Puzzles et jeux',
                      'title.ja': 'パズルとゲーム',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    miscellaneous: {
                      path: '/content/cq:tags/caas/events/max/shop/miscellaneous',
                      tagID: 'caas:events/max/shop/miscellaneous',
                      name: 'miscellaneous',
                      tagImage: '',
                      title: 'Novelties &amp; Miscellany',
                      'title.de': 'Neuheiten & Verschiedenes',
                      'title.fr': 'Articles fantaisie et divers',
                      'title.ja': 'ノベルティその他',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                'career-center': {
                  path: '/content/cq:tags/caas/events/max/career-center',
                  tagID: 'caas:events/max/career-center',
                  name: 'career-center',
                  tagImage: '',
                  title: 'Career Center',
                  'title.ja': 'キャリアセンター',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    tips: {
                      path: '/content/cq:tags/caas/events/max/career-center/tips',
                      tagID: 'caas:events/max/career-center/tips',
                      name: 'tips',
                      tagImage: '',
                      title: 'Tips',
                      'title.ja': 'ヒント',
                      description: '',
                      'cq:movedTo': '',
                      tags: {
                        'creative-careers': {
                          path: '/content/cq:tags/caas/events/max/career-center/tips/creative-careers',
                          tagID: 'caas:events/max/career-center/tips/creative-careers',
                          name: 'creative-careers',
                          tagImage: '',
                          title: 'Creative Careers',
                          'title.de': 'Kreative Berufe',
                          'title.fr': 'Carrières dans la création',
                          'title.ja': 'クリエイティブキャリア',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        'resume-templates': {
                          path: '/content/cq:tags/caas/events/max/career-center/tips/resume-templates',
                          tagID: 'caas:events/max/career-center/tips/resume-templates',
                          name: 'resume-templates',
                          tagImage: '',
                          title: 'Resume Templates',
                          'title.de': 'Lebenslaufvorlagen',
                          'title.fr': 'Modèles de CV',
                          'title.ja': '履歴書テンプレート',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        'freelancing-tips': {
                          path: '/content/cq:tags/caas/events/max/career-center/tips/freelancing-tips',
                          tagID: 'caas:events/max/career-center/tips/freelancing-tips',
                          name: 'freelancing-tips',
                          tagImage: '',
                          title: 'Freelancing Tips',
                          'title.de': 'Tipps für Freiberufler',
                          'title.fr': 'Conseils pour le travail en freelance',
                          'title.ja': 'フリーランスのためのヒント',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        'management-advice': {
                          path: '/content/cq:tags/caas/events/max/career-center/tips/management-advice',
                          tagID: 'caas:events/max/career-center/tips/management-advice',
                          name: 'management-advice',
                          tagImage: '',
                          title: 'Management Advice',
                          'title.de': 'Management-Beratung',
                          'title.fr': 'Conseils en gestion',
                          'title.ja': 'マネージメントに関するアドバイス',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        'self-branding': {
                          path: '/content/cq:tags/caas/events/max/career-center/tips/self-branding',
                          tagID: 'caas:events/max/career-center/tips/self-branding',
                          name: 'self-branding',
                          tagImage: '',
                          title: 'Self-Branding',
                          'title.de': 'Selbstvermarktung',
                          'title.fr': 'Branding personnel',
                          'title.ja': 'セルフブランディング',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        'career-growth': {
                          path: '/content/cq:tags/caas/events/max/career-center/tips/career-growth',
                          tagID: 'caas:events/max/career-center/tips/career-growth',
                          name: 'career-growth',
                          tagImage: '',
                          title: 'Career Growth',
                          'title.de': 'Karrierechancen',
                          'title.fr': 'Développement professionnel',
                          'title.ja': 'キャリアアップ',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        'virtual-interviews': {
                          path: '/content/cq:tags/caas/events/max/career-center/tips/virtual-interviews',
                          tagID: 'caas:events/max/career-center/tips/virtual-interviews',
                          name: 'virtual-interviews',
                          tagImage: '',
                          title: 'Virtual Interviews',
                          'title.de': 'Virtuelle Interviews',
                          'title.fr': 'Entretiens virtuels',
                          'title.ja': 'オンライン面接',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                      },
                    },
                    skills: {
                      path: '/content/cq:tags/caas/events/max/career-center/skills',
                      tagID: 'caas:events/max/career-center/skills',
                      name: 'skills',
                      tagImage: '',
                      title: 'Skills',
                      'title.ja': 'スキル',
                      description: '',
                      'cq:movedTo': '',
                      tags: {
                        'creative-careers': {
                          path: '/content/cq:tags/caas/events/max/career-center/skills/creative-careers',
                          tagID: 'caas:events/max/career-center/skills/creative-careers',
                          name: 'creative-careers',
                          tagImage: '',
                          title: 'Creative Careers',
                          'title.de': 'Kreative Berufe',
                          'title.fr': 'Carrières dans la création',
                          'title.ja': 'クリエイティブキャリア',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        'creative-inspiration': {
                          path: '/content/cq:tags/caas/events/max/career-center/skills/creative-inspiration',
                          tagID: 'caas:events/max/career-center/skills/creative-inspiration',
                          name: 'creative-inspiration',
                          tagImage: '',
                          title: 'Creative Inspiration',
                          'title.de': 'Kreative Inspiration',
                          'title.fr': "Source d'inspiration",
                          'title.ja': '制作のヒントやアイデア',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        'photography-pro-tips': {
                          path: '/content/cq:tags/caas/events/max/career-center/skills/photography-pro-tips',
                          tagID: 'caas:events/max/career-center/skills/photography-pro-tips',
                          name: 'photography-pro-tips',
                          tagImage: '',
                          title: 'Photography Pro Tips',
                          'title.de': 'Profi-Tipps zu Fotografie',
                          'title.fr': 'Conseils de photographes professionnels',
                          'title.ja': 'プロの写真編集のコツ',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        'creative-skill-guide': {
                          path: '/content/cq:tags/caas/events/max/career-center/skills/creative-skill-guide',
                          tagID: 'caas:events/max/career-center/skills/creative-skill-guide',
                          name: 'creative-skill-guide',
                          tagImage: '',
                          title: 'Creative Skill Guide',
                          'title.de': 'Leitfaden für kreative Skills',
                          'title.fr': 'Guide des compétences du créatif',
                          'title.ja': 'クリエイティブスキルガイド',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                      },
                    },
                  },
                },
                'primary-track': {
                  path: '/content/cq:tags/caas/events/max/primary-track',
                  tagID: 'caas:events/max/primary-track',
                  name: 'primary-track',
                  tagImage: '',
                  title: 'Primary Track',
                  'title.ja': '主なトラック',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    video: {
                      path: '/content/cq:tags/caas/events/max/primary-track/video',
                      tagID: 'caas:events/max/primary-track/video',
                      name: 'video',
                      tagImage: '',
                      title: 'Video',
                      'title.de': 'Video',
                      'title.fr': 'Vidéo',
                      'title.ja': '動画',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'social-media': {
                      path: '/content/cq:tags/caas/events/max/primary-track/social-media',
                      tagID: 'caas:events/max/primary-track/social-media',
                      name: 'social-media',
                      tagImage: '',
                      title: 'Social Media',
                      'title.de': 'Social Media',
                      'title.fr': 'Réseaux sociaux',
                      'title.ja': 'ソーシャルメディア',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    education: {
                      path: '/content/cq:tags/caas/events/max/primary-track/education',
                      tagID: 'caas:events/max/primary-track/education',
                      name: 'education',
                      tagImage: '',
                      title: 'Education',
                      'title.de': 'Aus- & Weiterbildung',
                      'title.fr': 'Enseignement',
                      'title.ja': '教育',
                      description:
                        'Students need opportunities to develop the essential creative and digital literacy skills that open doors to a brighter future. Whether you’re leading a creative curriculum or want to use creativity to enhance your classroom, learn from leading educators and experts who cultivate these skills and engage students as digital creators.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'business-productivity': {
                      path: '/content/cq:tags/caas/events/max/primary-track/business-productivity',
                      tagID: 'caas:events/max/primary-track/business-productivity',
                      name: 'business-productivity',
                      tagImage: '',
                      title: 'Business Productivity',
                      'title.de': 'Produktivität im Unternehmen',
                      'title.fr': 'Productivité commerciale',
                      'title.ja': 'ビジネスの生産性',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'illustration-and-digital-painting': {
                      path: '/content/cq:tags/caas/events/max/primary-track/illustration-and-digital-painting',
                      tagID: 'caas:events/max/primary-track/illustration-and-digital-painting',
                      name: 'illustration-and-digital-painting',
                      tagImage: '',
                      title: 'Illustration and Digital Painting',
                      'title.de': 'Illustration, digitales Malen & Zeichnen',
                      'title.fr': 'Peinture numérique et illustration',
                      'title.ja': 'イラストとデジタルペインティング',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    photography: {
                      path: '/content/cq:tags/caas/events/max/primary-track/photography',
                      tagID: 'caas:events/max/primary-track/photography',
                      name: 'photography',
                      tagImage: '',
                      title: 'Photography',
                      'title.de': 'Fotografie',
                      'title.fr': 'Photographie',
                      'title.ja': '写真',
                      description:
                        'Build your photography skills and create stunning photos with your smartphone or mirrorless camera. See how you can easily shoot, edit, and share your photos from anywhere and effortlessly move your images, along with your edits, between your mobile devices and desktop.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'graphic-design': {
                      path: '/content/cq:tags/caas/events/max/primary-track/graphic-design',
                      tagID: 'caas:events/max/primary-track/graphic-design',
                      name: 'graphic-design',
                      tagImage: '',
                      title: 'Graphic Design',
                      'title.de': 'Grafikdesign',
                      'title.fr': 'Design graphique',
                      'title.ja': 'グラフィックデザイン',
                      description:
                        'Whether you’re an established designer looking to discover new techniques or getting started and trying to learn lasting skills, this track covers everything from digital, web, and print graphics to logos, icons, photo manipulation, compositing, 3D, publication, and data visualization.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'ui-and-ux': {
                      path: '/content/cq:tags/caas/events/max/primary-track/ui-and-ux',
                      tagID: 'caas:events/max/primary-track/ui-and-ux',
                      name: 'ui-and-ux',
                      tagImage: '',
                      title: 'UI and UX',
                      'title.de': 'UI & UX',
                      'title.fr': 'UI et UX',
                      'title.ja': 'UI & UX',
                      description:
                        'Whether you’re completely new to UI/UX design or an experienced designer looking to grow your skills, these sessions will cover everything from getting started with Adobe XD to advanced prototyping techniques. Learn about designing websites, apps, and other digital experiences with XD and how to use XD alongside other Creative Cloud apps.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    '3d-and-ar': {
                      path: '/content/cq:tags/caas/events/max/primary-track/3d-and-ar',
                      tagID: 'caas:events/max/primary-track/3d-and-ar',
                      name: '3d-and-ar',
                      tagImage: '',
                      title: '3D and AR',
                      'title.de': '3D & AR',
                      'title.fr': '3D & AR',
                      'title.ja': '3DとAR',
                      description:
                        'Discover how to create state-of-the-art 3D designs and inspiring 3D art. Learn how to use the Adobe Substance 3D Collection to build models and sculpt in VR, assemble photorealistic 3D scenes, texture your 3D assets, work from real-life photos to create digital materials, and build your parametric materials.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'creativity-and-design-in-business': {
                      path: '/content/cq:tags/caas/events/max/primary-track/creativity-and-design-in-business',
                      tagID: 'caas:events/max/primary-track/creativity-and-design-in-business',
                      name: 'creativity-and-design-in-business',
                      tagImage: '',
                      title: 'Creativity and Design in Business',
                      'title.de': 'Foto, Video & Design in Unternehmen',
                      'title.fr': 'Créativité et design au service de l’entreprise',
                      'title.ja': 'ビジネスにおけるクリエイティビティ',
                      description:
                        'Design leaders from the world’s most engaging brands and agencies will share their learnings, best practices, and expertise as creative innovators. Topics range from brand reinvention and creative leadership strategies to team collaboration and brave new creative tools.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'collaboration-and-productivity': {
                      path: '/content/cq:tags/caas/events/max/primary-track/collaboration-and-productivity',
                      tagID: 'caas:events/max/primary-track/collaboration-and-productivity',
                      name: 'collaboration-and-productivity',
                      tagImage: '',
                      title: 'Collaboration and Productivity',
                      'title.ja': 'コラボレーションと生産性',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'meet-the-adobe-teams': {
                      path: '/content/cq:tags/caas/events/max/primary-track/meet-the-adobe-teams',
                      tagID: 'caas:events/max/primary-track/meet-the-adobe-teams',
                      name: 'meet-the-adobe-teams',
                      tagImage: '',
                      title: 'Meet the Adobe Teams',
                      'title.ja': 'Meet the Adobe Teams',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'community-live-lounge': {
                      path: '/content/cq:tags/caas/events/max/primary-track/community-live-lounge',
                      tagID: 'caas:events/max/primary-track/community-live-lounge',
                      name: 'community-live-lounge',
                      tagImage: '',
                      title: 'Community Live Lounge',
                      'title.ja': 'コミュニティライブラウンジ',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'live-broadcast': {
                      path: '/content/cq:tags/caas/events/max/primary-track/live-broadcast',
                      tagID: 'caas:events/max/primary-track/live-broadcast',
                      name: 'live-broadcast',
                      tagImage: '',
                      title: 'Mainstage Broadcast',
                      'title.de': 'Mainstage Broadcast',
                      'title.fr': 'Mainstage Broadcast',
                      'title.ja': 'メインステージ配信',
                      description:
                        'Don’t miss the Mainstage Broadcast of keynotes, Sneaks, and Creativity Super Sessions. You’ll get the latest creative industry trends and updates to Adobe Creative Cloud and be inspired by the stories from top luminary speakers.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'drawing-painting-and-illustration': {
                      path: '/content/cq:tags/caas/events/max/primary-track/drawing-painting-and-illustration',
                      tagID: 'caas:events/max/primary-track/drawing-painting-and-illustration',
                      name: 'drawing-painting-and-illustration',
                      tagImage: '',
                      title: 'Drawing, Painting, and Illustration',
                      'title.ja': 'イラスト・描画',
                      description:
                        'Take bold new strokes for drawing and painting, from fine art to anime, watercolors to photo collage, and logos to illustrations. Whether you’re a beginner or an experienced professional, you’ll find ideas, inspiration, and skill building from leading digital artists and designers.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'social-media-and-marketing': {
                      path: '/content/cq:tags/caas/events/max/primary-track/social-media-and-marketing',
                      tagID: 'caas:events/max/primary-track/social-media-and-marketing',
                      name: 'social-media-and-marketing',
                      tagImage: '',
                      title: 'Social Media and Marketing',
                      'title.ja': 'ソーシャルメディアとマーケティング',
                      description:
                        'Leverage the power of social media and digital marketing to establish your brand, grow your business, and build a following. Learn how to make high-quality content quickly, how to get the most out of each post on every social platform, and how to stand out when marketing your business across channels.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'video-audio-and-motion': {
                      path: '/content/cq:tags/caas/events/max/primary-track/video-audio-and-motion',
                      tagID: 'caas:events/max/primary-track/video-audio-and-motion',
                      name: 'video-audio-and-motion',
                      tagImage: '',
                      title: 'Video, Audio, and Motion',
                      'title.ja': '動画・オーディオ・モーション',
                      description:
                        'Develop the skills you need to put your creativity in motion. Learn how to edit your first video, transform static graphics into motion, create an animated explainer video, and apply visual effects to a marketing video. Discover how to collaborate more effectively with clients and colleagues with technologies such as Frame.io.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'adobe-live-at-max': {
                      path: '/content/cq:tags/caas/events/max/primary-track/adobe-live-at-max',
                      tagID: 'caas:events/max/primary-track/adobe-live-at-max',
                      name: 'adobe-live-at-max',
                      tagImage: '',
                      title: 'Adobe Live @ MAX',
                      'title.ja': 'Adobe Live @ MAX',
                      description:
                        'Visit your favorite MAX speakers virtually to get your questions answered. Tune into the First Take sessions to watch professional designers from the community show off the newest Creative Cloud features.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    '3d': {
                      path: '/content/cq:tags/caas/events/max/primary-track/3d',
                      tagID: 'caas:events/max/primary-track/3d',
                      name: '3d',
                      tagImage: '',
                      title: '3D',
                      description:
                        'Unlock the power of 3D in your design workflows and power your career to new heights with 3D design skills. Hear from experts in graphic design, packaging, motion design, and marketing to learn how the world’s best-known brands are creating amazing 3D experiences.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                giveaway: {
                  path: '/content/cq:tags/caas/events/max/giveaway',
                  tagID: 'caas:events/max/giveaway',
                  name: 'giveaway',
                  tagImage: '',
                  title: 'Giveaway',
                  'title.ja': 'プレゼント',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            year: {
              path: '/content/cq:tags/caas/events/year',
              tagID: 'caas:events/year',
              name: 'year',
              tagImage: '',
              title: 'Year',
              description: '',
              'cq:movedTo': '',
              tags: {
                2020: {
                  path: '/content/cq:tags/caas/events/year/2020',
                  tagID: 'caas:events/year/2020',
                  name: '2020',
                  tagImage: '',
                  title: '2020',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                2021: {
                  path: '/content/cq:tags/caas/events/year/2021',
                  tagID: 'caas:events/year/2021',
                  name: '2021',
                  tagImage: '',
                  title: '2021',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                2022: {
                  path: '/content/cq:tags/caas/events/year/2022',
                  tagID: 'caas:events/year/2022',
                  name: '2022',
                  tagImage: '',
                  title: '2022',
                  'title.ja': '2022',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                2023: {
                  path: '/content/cq:tags/caas/events/year/2023',
                  tagID: 'caas:events/year/2023',
                  name: '2023',
                  tagImage: '',
                  title: '2023',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                2024: {
                  path: '/content/cq:tags/caas/events/year/2024',
                  tagID: 'caas:events/year/2024',
                  name: '2024',
                  tagImage: '',
                  title: '2024',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            'speaker-type': {
              path: '/content/cq:tags/caas/events/speaker-type',
              tagID: 'caas:events/speaker-type',
              name: 'speaker-type',
              tagImage: '',
              title: 'Speaker Type',
              'title.de': 'Kategorie',
              'title.ja': '得意分野',
              description: '',
              'cq:movedTo': '',
              tags: {
                'max-master': {
                  path: '/content/cq:tags/caas/events/speaker-type/max-master',
                  tagID: 'caas:events/speaker-type/max-master',
                  name: 'max-master',
                  tagImage: '',
                  title: 'MAX Master',
                  'title.de': 'MAX Master',
                  'title.es': 'MAX Master',
                  'title.ja': 'MAX Master',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                luminary: {
                  path: '/content/cq:tags/caas/events/speaker-type/luminary',
                  tagID: 'caas:events/speaker-type/luminary',
                  name: 'luminary',
                  tagImage: '',
                  title: 'Luminary',
                  'title.de': 'Luminary',
                  'title.fr': 'Expert',
                  'title.ja': 'スタークリエイター',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                keynote: {
                  path: '/content/cq:tags/caas/events/speaker-type/keynote',
                  tagID: 'caas:events/speaker-type/keynote',
                  name: 'keynote',
                  tagImage: '',
                  title: 'Keynote',
                  'title.de': 'Keynote',
                  'title.fr': 'Keynote',
                  'title.ja': 'キーノート',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                celebrity: {
                  path: '/content/cq:tags/caas/events/speaker-type/celebrity',
                  tagID: 'caas:events/speaker-type/celebrity',
                  name: 'celebrity',
                  tagImage: '',
                  title: 'Celebrity',
                  'title.de': 'Celebrity',
                  'title.fr': 'Célébrité',
                  'title.ja': '著名人',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                evangelist: {
                  path: '/content/cq:tags/caas/events/speaker-type/evangelist',
                  tagID: 'caas:events/speaker-type/evangelist',
                  name: 'evangelist',
                  tagImage: '',
                  title: 'Evangelist',
                  'title.de': 'Evangelist',
                  'title.fr': 'Spécialiste',
                  'title.ja': 'エバンジェリスト',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                headliner: {
                  path: '/content/cq:tags/caas/events/speaker-type/headliner',
                  tagID: 'caas:events/speaker-type/headliner',
                  name: 'headliner',
                  tagImage: '',
                  title: 'Headliner',
                  'title.de': 'Headliner',
                  'title.fr': 'Vedette',
                  'title.ja': 'スペシャルゲスト',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                sneaks: {
                  path: '/content/cq:tags/caas/events/speaker-type/sneaks',
                  tagID: 'caas:events/speaker-type/sneaks',
                  name: 'sneaks',
                  tagImage: '',
                  title: 'Sneaks',
                  'title.de': 'Sneaks',
                  'title.fr': 'Sneaks',
                  'title.ja': 'プレビュー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'innovation-super-session': {
                  path: '/content/cq:tags/caas/events/speaker-type/innovation-super-session',
                  tagID: 'caas:events/speaker-type/innovation-super-session',
                  name: 'innovation-super-session',
                  tagImage: '',
                  title: 'Innovation Super Session',
                  'title.ja': 'イノベーションスーパーセッション',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                session: {
                  path: '/content/cq:tags/caas/events/speaker-type/session',
                  tagID: 'caas:events/speaker-type/session',
                  name: 'session',
                  tagImage: '',
                  title: 'Session',
                  'title.ja': 'セッション',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'keynote-and-luminary': {
                  path: '/content/cq:tags/caas/events/speaker-type/keynote-and-luminary',
                  tagID: 'caas:events/speaker-type/keynote-and-luminary',
                  name: 'keynote-and-luminary',
                  tagImage: '',
                  title: 'Keynote and Luminary',
                  'title.ja': 'キーノート／著名人によるセッション',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'session-and-lab': {
                  path: '/content/cq:tags/caas/events/speaker-type/session-and-lab',
                  tagID: 'caas:events/speaker-type/session-and-lab',
                  name: 'session-and-lab',
                  tagImage: '',
                  title: 'Session and Lab',
                  'title.ja': 'セッション／ラボ',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'keynotes-and-sneaks': {
                  path: '/content/cq:tags/caas/events/speaker-type/keynotes-and-sneaks',
                  tagID: 'caas:events/speaker-type/keynotes-and-sneaks',
                  name: 'keynotes-and-sneaks',
                  tagImage: '',
                  title: 'Keynotes and Sneaks',
                  'title.ja': 'キーノート／スニークプレビュー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'ask-the-experts': {
                  path: '/content/cq:tags/caas/events/speaker-type/ask-the-experts',
                  tagID: 'caas:events/speaker-type/ask-the-experts',
                  name: 'ask-the-experts',
                  tagImage: '',
                  title: 'Ask the experts',
                  'title.ja': 'Ask the experts',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'live-broadcast': {
                  path: '/content/cq:tags/caas/events/speaker-type/live-broadcast',
                  tagID: 'caas:events/speaker-type/live-broadcast',
                  name: 'live-broadcast',
                  tagImage: '',
                  title: 'Mainstage Broadcast',
                  'title.ja': 'メインステージ配信',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'preconference-training': {
                  path: '/content/cq:tags/caas/events/speaker-type/preconference-training',
                  tagID: 'caas:events/speaker-type/preconference-training',
                  name: 'preconference-training',
                  tagImage: '',
                  title: 'Preconference Training',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'skill-exchange': {
                  path: '/content/cq:tags/caas/events/speaker-type/skill-exchange',
                  tagID: 'caas:events/speaker-type/skill-exchange',
                  name: 'skill-exchange',
                  tagImage: '',
                  title: 'Skill Exchange',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'strategy-keynote': {
                  path: '/content/cq:tags/caas/events/speaker-type/strategy-keynote',
                  tagID: 'caas:events/speaker-type/strategy-keynote',
                  name: 'strategy-keynote',
                  tagImage: '',
                  title: 'Strategy Keynote',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                lab: {
                  path: '/content/cq:tags/caas/events/speaker-type/lab',
                  tagID: 'caas:events/speaker-type/lab',
                  name: 'lab',
                  tagImage: '',
                  title: 'Lab',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            'event-session-type': {
              path: '/content/cq:tags/caas/events/event-session-type',
              tagID: 'caas:events/event-session-type',
              name: 'event-session-type',
              tagImage: '',
              title: 'Event Session Type',
              description: '',
              'cq:movedTo': '',
              tags: {
                'on-demand-scheduled': {
                  path: '/content/cq:tags/caas/events/event-session-type/on-demand-scheduled',
                  tagID: 'caas:events/event-session-type/on-demand-scheduled',
                  name: 'on-demand-scheduled',
                  tagImage: '',
                  title: 'On-Demand Scheduled',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'live-expired': {
                  path: '/content/cq:tags/caas/events/event-session-type/live-expired',
                  tagID: 'caas:events/event-session-type/live-expired',
                  name: 'live-expired',
                  tagImage: '',
                  title: 'Live Expired',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'big-tent': {
                  path: '/content/cq:tags/caas/events/event-session-type/big-tent',
                  tagID: 'caas:events/event-session-type/big-tent',
                  name: 'big-tent',
                  tagImage: '',
                  title: 'Big Tent',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    live: {
                      path: '/content/cq:tags/caas/events/event-session-type/big-tent/live',
                      tagID: 'caas:events/event-session-type/big-tent/live',
                      name: 'live',
                      tagImage: '',
                      title: 'Live',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'on-demand': {
                      path: '/content/cq:tags/caas/events/event-session-type/big-tent/on-demand',
                      tagID: 'caas:events/event-session-type/big-tent/on-demand',
                      name: 'on-demand',
                      tagImage: '',
                      title: 'On-Demand',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                'livestreamed-content': {
                  path: '/content/cq:tags/caas/events/event-session-type/livestreamed-content',
                  tagID: 'caas:events/event-session-type/livestreamed-content',
                  name: 'livestreamed-content',
                  tagImage: '',
                  title: 'Livestreamed Content',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    live: {
                      path: '/content/cq:tags/caas/events/event-session-type/livestreamed-content/live',
                      tagID: 'caas:events/event-session-type/livestreamed-content/live',
                      name: 'live',
                      tagImage: '',
                      title: 'Live',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'on-demand': {
                      path: '/content/cq:tags/caas/events/event-session-type/livestreamed-content/on-demand',
                      tagID: 'caas:events/event-session-type/livestreamed-content/on-demand',
                      name: 'on-demand',
                      tagImage: '',
                      title: 'On-Demand',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
              },
            },
            day: {
              path: '/content/cq:tags/caas/events/day',
              tagID: 'caas:events/day',
              name: 'day',
              tagImage: '',
              title: 'Day',
              'title.de': 'Tag',
              'title.fr': 'Jour',
              'title.ja': '日',
              description: '',
              'cq:movedTo': '',
              tags: {
                'day-1': {
                  path: '/content/cq:tags/caas/events/day/day-1',
                  tagID: 'caas:events/day/day-1',
                  name: 'day-1',
                  tagImage: '',
                  title: 'Day 1',
                  'title.de': 'Tag 1',
                  'title.fr': 'Jour 1',
                  'title.ja': '1日目',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'day-2': {
                  path: '/content/cq:tags/caas/events/day/day-2',
                  tagID: 'caas:events/day/day-2',
                  name: 'day-2',
                  tagImage: '',
                  title: 'Day 2',
                  'title.de': 'Tag 2',
                  'title.fr': 'Jour 2',
                  'title.ja': '2日目',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'day-3': {
                  path: '/content/cq:tags/caas/events/day/day-3',
                  tagID: 'caas:events/day/day-3',
                  name: 'day-3',
                  tagImage: '',
                  title: 'Day 3',
                  'title.de': 'Tag 3 ',
                  'title.fr': 'Jour 3 ',
                  'title.ja': '3日目',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'americas-day-1': {
                  path: '/content/cq:tags/caas/events/day/americas-day-1',
                  tagID: 'caas:events/day/americas-day-1',
                  name: 'americas-day-1',
                  tagImage: '',
                  title: 'Americas Day 1',
                  'title.ja': '南北アメリカ 1日目',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'americas-day-2': {
                  path: '/content/cq:tags/caas/events/day/americas-day-2',
                  tagID: 'caas:events/day/americas-day-2',
                  name: 'americas-day-2',
                  tagImage: '',
                  title: 'Americas Day 2',
                  'title.ja': '南北アメリカ 2日目',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'australia-new-zealand-day-1': {
                  path: '/content/cq:tags/caas/events/day/australia-new-zealand-day-1',
                  tagID: 'caas:events/day/australia-new-zealand-day-1',
                  name: 'australia-new-zealand-day-1',
                  tagImage: '',
                  title: 'Australia and New Zealand Day 1',
                  'title.ja': 'オーストラリア、ニュージーランド 1日目',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'asia-india-day-1': {
                  path: '/content/cq:tags/caas/events/day/asia-india-day-1',
                  tagID: 'caas:events/day/asia-india-day-1',
                  name: 'asia-india-day-1',
                  tagImage: '',
                  title: 'Asia and India Day 1',
                  'title.ja': '東南アジア、インド 1日目',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'europe-middle-east-africa-day-1': {
                  path: '/content/cq:tags/caas/events/day/europe-middle-east-africa-day-1',
                  tagID: 'caas:events/day/europe-middle-east-africa-day-1',
                  name: 'europe-middle-east-africa-day-1',
                  tagImage: '',
                  title: 'Europe, Middle East, and Africa Day 1',
                  'title.ja': 'ヨーロッパ、中東、アフリカ 1日目',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'asia-day-1': {
                  path: '/content/cq:tags/caas/events/day/asia-day-1',
                  tagID: 'caas:events/day/asia-day-1',
                  name: 'asia-day-1',
                  tagImage: '',
                  title: 'Asia Day 1',
                  'title.ja': 'アジア 1日目',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'europe-middle-east-africa-day-2': {
                  path: '/content/cq:tags/caas/events/day/europe-middle-east-africa-day-2',
                  tagID: 'caas:events/day/europe-middle-east-africa-day-2',
                  name: 'europe-middle-east-africa-day-2',
                  tagImage: '',
                  title: 'Europe, Middle East, and Africa Day 2',
                  'title.ja': 'ヨーロッパ、中東、アフリカ 2日目',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'asia-pacific': {
                  path: '/content/cq:tags/caas/events/day/asia-pacific',
                  tagID: 'caas:events/day/asia-pacific',
                  name: 'asia-pacific',
                  tagImage: '',
                  title: 'Asia Pacific',
                  'title.ja': 'アジア太平洋',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                japan: {
                  path: '/content/cq:tags/caas/events/day/japan',
                  tagID: 'caas:events/day/japan',
                  name: 'japan',
                  tagImage: '',
                  title: 'Japan',
                  'title.ja': '日本',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'europe-middle-east-africa': {
                  path: '/content/cq:tags/caas/events/day/europe-middle-east-africa',
                  tagID: 'caas:events/day/europe-middle-east-africa',
                  name: 'europe-middle-east-africa',
                  tagImage: '',
                  title: 'Europe, Middle East, and Africa',
                  'title.ja': 'ヨーロッパ、中東、アフリカ',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'asia-pacific-day-1': {
                  path: '/content/cq:tags/caas/events/day/asia-pacific-day-1',
                  tagID: 'caas:events/day/asia-pacific-day-1',
                  name: 'asia-pacific-day-1',
                  tagImage: '',
                  title: 'Asia Pacific Day 1',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'asia-pacific-day-2': {
                  path: '/content/cq:tags/caas/events/day/asia-pacific-day-2',
                  tagID: 'caas:events/day/asia-pacific-day-2',
                  name: 'asia-pacific-day-2',
                  tagImage: '',
                  title: 'Asia Pacific Day 2',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            'podcast-type': {
              path: '/content/cq:tags/caas/events/podcast-type',
              tagID: 'caas:events/podcast-type',
              name: 'podcast-type',
              tagImage: '',
              title: 'Podcast Type',
              description: '',
              'cq:movedTo': '',
              tags: {
                'deeply-graphic-designcast': {
                  path: '/content/cq:tags/caas/events/podcast-type/deeply-graphic-designcast',
                  tagID: 'caas:events/podcast-type/deeply-graphic-designcast',
                  name: 'deeply-graphic-designcast',
                  tagImage: '',
                  title: 'Deeply Graphic DesignCast',
                  'title.de': 'Deeply Graphic DesignCast',
                  'title.fr': 'Deeply Graphic DesignCast (DGDC)',
                  'title.ja': 'Deeply Graphic DesignCast',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'futur-podcast': {
                  path: '/content/cq:tags/caas/events/podcast-type/futur-podcast',
                  tagID: 'caas:events/podcast-type/futur-podcast',
                  name: 'futur-podcast',
                  tagImage: '',
                  title: 'Futur Podcast',
                  'title.de': 'The Futur-Podcast',
                  'title.fr': 'Podcast The Futur',
                  'title.ja': 'The Futur（ポッドキャスト）',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'design-matters': {
                  path: '/content/cq:tags/caas/events/podcast-type/design-matters',
                  tagID: 'caas:events/podcast-type/design-matters',
                  name: 'design-matters',
                  tagImage: '',
                  title: 'Design Matters',
                  'title.de': 'Design Matters',
                  'title.fr': 'Design Matters',
                  'title.ja': 'Design Matters',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'clever-podcast': {
                  path: '/content/cq:tags/caas/events/podcast-type/clever-podcast',
                  tagID: 'caas:events/podcast-type/clever-podcast',
                  name: 'clever-podcast',
                  tagImage: '',
                  title: 'Clever Podcast',
                  'title.de': 'Clever-Podcast',
                  'title.fr': 'Podcast Clever',
                  'title.ja': 'Clever（ポッドキャスト）',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                wireframe: {
                  path: '/content/cq:tags/caas/events/podcast-type/wireframe',
                  tagID: 'caas:events/podcast-type/wireframe',
                  name: 'wireframe',
                  tagImage: '',
                  title: 'Wireframe',
                  'title.de': 'Wireframe',
                  'title.fr': 'Wireframe',
                  'title.ja': 'Wireframe',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            speaker: {
              path: '/content/cq:tags/caas/events/speaker',
              tagID: 'caas:events/speaker',
              name: 'speaker',
              tagImage: '',
              title: 'Speaker',
              'title.de': 'Vortragende',
              'title.fr': 'Intervenant',
              'title.ja': '講演者',
              description: '',
              'cq:movedTo': '',
              tags: {
                'max-speaker': {
                  path: '/content/cq:tags/caas/events/speaker/max-speaker',
                  tagID: 'caas:events/speaker/max-speaker',
                  name: 'max-speaker',
                  tagImage: '',
                  title: 'MAX Speaker',
                  'title.de': 'MAX-Referent/in',
                  'title.fr': 'Intervenant MAX',
                  'title.ja': 'MAXスピーカー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            'sponsor-level': {
              path: '/content/cq:tags/caas/events/sponsor-level',
              tagID: 'caas:events/sponsor-level',
              name: 'sponsor-level',
              tagImage: '',
              title: 'Sponsor Level',
              description: '',
              'cq:movedTo': '',
              tags: {
                diamond: {
                  path: '/content/cq:tags/caas/events/sponsor-level/diamond',
                  tagID: 'caas:events/sponsor-level/diamond',
                  name: 'diamond',
                  tagImage: '',
                  title: 'Diamond',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                platinum: {
                  path: '/content/cq:tags/caas/events/sponsor-level/platinum',
                  tagID: 'caas:events/sponsor-level/platinum',
                  name: 'platinum',
                  tagImage: '',
                  title: 'Platinum',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                gold: {
                  path: '/content/cq:tags/caas/events/sponsor-level/gold',
                  tagID: 'caas:events/sponsor-level/gold',
                  name: 'gold',
                  tagImage: '',
                  title: 'Gold',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                silver: {
                  path: '/content/cq:tags/caas/events/sponsor-level/silver',
                  tagID: 'caas:events/sponsor-level/silver',
                  name: 'silver',
                  tagImage: '',
                  title: 'Silver',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                bronze: {
                  path: '/content/cq:tags/caas/events/sponsor-level/bronze',
                  tagID: 'caas:events/sponsor-level/bronze',
                  name: 'bronze',
                  tagImage: '',
                  title: 'Bronze',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                exhibitor: {
                  path: '/content/cq:tags/caas/events/sponsor-level/exhibitor',
                  tagID: 'caas:events/sponsor-level/exhibitor',
                  name: 'exhibitor',
                  tagImage: '',
                  title: 'Exhibitor',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            summit: {
              path: '/content/cq:tags/caas/events/summit',
              tagID: 'caas:events/summit',
              name: 'summit',
              tagImage: '',
              title: 'Summit',
              description: '',
              'cq:movedTo': '',
              tags: {
                'area-of-expertise': {
                  path: '/content/cq:tags/caas/events/summit/area-of-expertise',
                  tagID: 'caas:events/summit/area-of-expertise',
                  name: 'area-of-expertise',
                  tagImage: '',
                  title: 'Area of Expertise',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    advertiser: {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/advertiser',
                      tagID: 'caas:events/summit/area-of-expertise/advertiser',
                      name: 'advertiser',
                      tagImage: '',
                      title: 'Advertiser',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'audience-strategist': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/audience-strategist',
                      tagID: 'caas:events/summit/area-of-expertise/audience-strategist',
                      name: 'audience-strategist',
                      tagImage: '',
                      title: 'Audience Strategist',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'business-analyst': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/business-analyst',
                      tagID: 'caas:events/summit/area-of-expertise/business-analyst',
                      name: 'business-analyst',
                      tagImage: '',
                      title: 'Business Analyst',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'campaign-manager': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/campaign-manager',
                      tagID: 'caas:events/summit/area-of-expertise/campaign-manager',
                      name: 'campaign-manager',
                      tagImage: '',
                      title: 'Campaign Manager',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'channel-marketer': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/channel-marketer',
                      tagID: 'caas:events/summit/area-of-expertise/channel-marketer',
                      name: 'channel-marketer',
                      tagImage: '',
                      title: 'Channel Marketer',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'commerce-executive': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/commerce-executive',
                      tagID: 'caas:events/summit/area-of-expertise/commerce-executive',
                      name: 'commerce-executive',
                      tagImage: '',
                      title: 'Commerce Executive',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'commerce-marketer': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/commerce-marketer',
                      tagID: 'caas:events/summit/area-of-expertise/commerce-marketer',
                      name: 'commerce-marketer',
                      tagImage: '',
                      title: 'Commerce Marketer',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'content-marketer': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/content-marketer',
                      tagID: 'caas:events/summit/area-of-expertise/content-marketer',
                      name: 'content-marketer',
                      tagImage: '',
                      title: 'Content Marketer',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'creative-leader': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/creative-leader',
                      tagID: 'caas:events/summit/area-of-expertise/creative-leader',
                      name: 'creative-leader',
                      tagImage: '',
                      title: 'Creative Leader',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'data-scientist': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/data-scientist',
                      tagID: 'caas:events/summit/area-of-expertise/data-scientist',
                      name: 'data-scientist',
                      tagImage: '',
                      title: 'Data Scientist',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'database-marketing-manager': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/database-marketing-manager',
                      tagID: 'caas:events/summit/area-of-expertise/database-marketing-manager',
                      name: 'database-marketing-manager',
                      tagImage: '',
                      title: 'Database Marketing Manager',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    developer: {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/developer',
                      tagID: 'caas:events/summit/area-of-expertise/developer',
                      name: 'developer',
                      tagImage: '',
                      title: 'Developer',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'digital-analyst': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/digital-analyst',
                      tagID: 'caas:events/summit/area-of-expertise/digital-analyst',
                      name: 'digital-analyst',
                      tagImage: '',
                      title: 'Digital Analyst',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'digital-marketer': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/digital-marketer',
                      tagID: 'caas:events/summit/area-of-expertise/digital-marketer',
                      name: 'digital-marketer',
                      tagImage: '',
                      title: 'Digital Marketer',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'email-marketer': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/email-marketer',
                      tagID: 'caas:events/summit/area-of-expertise/email-marketer',
                      name: 'email-marketer',
                      tagImage: '',
                      title: 'Email Marketer',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'it-architect': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/it-architect',
                      tagID: 'caas:events/summit/area-of-expertise/it-architect',
                      name: 'it-architect',
                      tagImage: '',
                      title: 'IT Architect',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'it-executive': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/it-executive',
                      tagID: 'caas:events/summit/area-of-expertise/it-executive',
                      name: 'it-executive',
                      tagImage: '',
                      title: 'IT Executive',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'marketing-executive': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/marketing-executive',
                      tagID: 'caas:events/summit/area-of-expertise/marketing-executive',
                      name: 'marketing-executive',
                      tagImage: '',
                      title: 'Marketing Executive',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'mobile-marketer': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/mobile-marketer',
                      tagID: 'caas:events/summit/area-of-expertise/mobile-marketer',
                      name: 'mobile-marketer',
                      tagImage: '',
                      title: 'Mobile Marketer',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'operations-coo': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/operations-coo',
                      tagID: 'caas:events/summit/area-of-expertise/operations-coo',
                      name: 'operations-coo',
                      tagImage: '',
                      title: 'Operations &amp; COO',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'optimization-manager': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/optimization-manager',
                      tagID: 'caas:events/summit/area-of-expertise/optimization-manager',
                      name: 'optimization-manager',
                      tagImage: '',
                      title: 'Optimization Manager',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    publisher: {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/publisher',
                      tagID: 'caas:events/summit/area-of-expertise/publisher',
                      name: 'publisher',
                      tagImage: '',
                      title: 'Publisher',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'project-manager': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/project-manager',
                      tagID: 'caas:events/summit/area-of-expertise/project-manager',
                      name: 'project-manager',
                      tagImage: '',
                      title: 'Project Manager',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'segmentation-specialist': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/segmentation-specialist',
                      tagID: 'caas:events/summit/area-of-expertise/segmentation-specialist',
                      name: 'segmentation-specialist',
                      tagImage: '',
                      title: 'Segmentation Specialist',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'social-marketer': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/social-marketer',
                      tagID: 'caas:events/summit/area-of-expertise/social-marketer',
                      name: 'social-marketer',
                      tagImage: '',
                      title: 'Social Marketer',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'technical-instructor': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/technical-instructor',
                      tagID: 'caas:events/summit/area-of-expertise/technical-instructor',
                      name: 'technical-instructor',
                      tagImage: '',
                      title: 'Technical Instructor',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'ux-ui-web-designer': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/ux-ui-web-designer',
                      tagID: 'caas:events/summit/area-of-expertise/ux-ui-web-designer',
                      name: 'ux-ui-web-designer',
                      tagImage: '',
                      title: 'UX &amp; UI Web Designer',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'web-analyst': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/web-analyst',
                      tagID: 'caas:events/summit/area-of-expertise/web-analyst',
                      name: 'web-analyst',
                      tagImage: '',
                      title: 'Web Analyst',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'web-marketer': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/web-marketer',
                      tagID: 'caas:events/summit/area-of-expertise/web-marketer',
                      name: 'web-marketer',
                      tagImage: '',
                      title: 'Web Marketer',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'product-manager': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/product-manager',
                      tagID: 'caas:events/summit/area-of-expertise/product-manager',
                      name: 'product-manager',
                      tagImage: '',
                      title: 'Product Manager',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'commerce-marketer-merchandiser': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/commerce-marketer-merchandiser',
                      tagID: 'caas:events/summit/area-of-expertise/commerce-marketer-merchandiser',
                      name: 'commerce-marketer-merchandiser',
                      tagImage: '',
                      title: 'Commerce Marketer or Merchandiser',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'web-designer': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/web-designer',
                      tagID: 'caas:events/summit/area-of-expertise/web-designer',
                      name: 'web-designer',
                      tagImage: '',
                      title: 'Web Designer',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    operations: {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/operations',
                      tagID: 'caas:events/summit/area-of-expertise/operations',
                      name: 'operations',
                      tagImage: '',
                      title: 'Operations',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'operations-executive': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/operations-executive',
                      tagID: 'caas:events/summit/area-of-expertise/operations-executive',
                      name: 'operations-executive',
                      tagImage: '',
                      title: 'Operations Executive',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'it-practitioner': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/it-practitioner',
                      tagID: 'caas:events/summit/area-of-expertise/it-practitioner',
                      name: 'it-practitioner',
                      tagImage: '',
                      title: 'IT Practitioner',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'marketing-practitioner': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/marketing-practitioner',
                      tagID: 'caas:events/summit/area-of-expertise/marketing-practitioner',
                      name: 'marketing-practitioner',
                      tagImage: '',
                      title: 'Marketing Practitioner',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'social-strategist': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/social-strategist',
                      tagID: 'caas:events/summit/area-of-expertise/social-strategist',
                      name: 'social-strategist',
                      tagImage: '',
                      title: 'Social Strategist',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'project-program-manager': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/project-program-manager',
                      tagID: 'caas:events/summit/area-of-expertise/project-program-manager',
                      name: 'project-program-manager',
                      tagImage: '',
                      title: 'Project or Program Manager',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'operations-professional': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/operations-professional',
                      tagID: 'caas:events/summit/area-of-expertise/operations-professional',
                      name: 'operations-professional',
                      tagImage: '',
                      title: 'Operations Professional',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'omnichannel-architect': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/omnichannel-architect',
                      tagID: 'caas:events/summit/area-of-expertise/omnichannel-architect',
                      name: 'omnichannel-architect',
                      tagImage: '',
                      title: 'Omnichannel Architect',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'marketing-technologist': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/marketing-technologist',
                      tagID: 'caas:events/summit/area-of-expertise/marketing-technologist',
                      name: 'marketing-technologist',
                      tagImage: '',
                      title: 'Marketing Technologist',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'marketing-operations': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/marketing-operations',
                      tagID: 'caas:events/summit/area-of-expertise/marketing-operations',
                      name: 'marketing-operations',
                      tagImage: '',
                      title: 'Marketing Operations',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'marketing-analyst': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/marketing-analyst',
                      tagID: 'caas:events/summit/area-of-expertise/marketing-analyst',
                      name: 'marketing-analyst',
                      tagImage: '',
                      title: 'Marketing Analyst',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'email-manager': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/email-manager',
                      tagID: 'caas:events/summit/area-of-expertise/email-manager',
                      name: 'email-manager',
                      tagImage: '',
                      title: 'Email Manager',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'it-professional': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/it-professional',
                      tagID: 'caas:events/summit/area-of-expertise/it-professional',
                      name: 'it-professional',
                      tagImage: '',
                      title: 'IT Professional',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    designer: {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/designer',
                      tagID: 'caas:events/summit/area-of-expertise/designer',
                      name: 'designer',
                      tagImage: '',
                      title: 'Designer',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'data-practitioner': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/data-practitioner',
                      tagID: 'caas:events/summit/area-of-expertise/data-practitioner',
                      name: 'data-practitioner',
                      tagImage: '',
                      title: 'Data Practitioner',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'content-manager': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/content-manager',
                      tagID: 'caas:events/summit/area-of-expertise/content-manager',
                      name: 'content-manager',
                      tagImage: '',
                      title: 'Content Manager',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'business-development-representative': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/business-development-representative',
                      tagID: 'caas:events/summit/area-of-expertise/business-development-representative',
                      name: 'business-development-representative',
                      tagImage: '',
                      title: 'Business Development Representative',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'commerce-professional': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/commerce-professional',
                      tagID: 'caas:events/summit/area-of-expertise/commerce-professional',
                      name: 'commerce-professional',
                      tagImage: '',
                      title: 'Commerce Professional',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'business-decision-maker': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/business-decision-maker',
                      tagID: 'caas:events/summit/area-of-expertise/business-decision-maker',
                      name: 'business-decision-maker',
                      tagImage: '',
                      title: 'Business Decision Maker',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'legal-privacy-officer': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/legal-privacy-officer',
                      tagID: 'caas:events/summit/area-of-expertise/legal-privacy-officer',
                      name: 'legal-privacy-officer',
                      tagImage: '',
                      title: 'Legal or Privacy Officer',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'people-manager': {
                      path: '/content/cq:tags/caas/events/summit/area-of-expertise/people-manager',
                      tagID: 'caas:events/summit/area-of-expertise/people-manager',
                      name: 'people-manager',
                      tagImage: '',
                      title: 'People Manager',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                track: {
                  path: '/content/cq:tags/caas/events/summit/track',
                  tagID: 'caas:events/summit/track',
                  name: 'track',
                  tagImage: '',
                  title: 'Track',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'adobe-experience-platform': {
                      path: '/content/cq:tags/caas/events/summit/track/adobe-experience-platform',
                      tagID: 'caas:events/summit/track/adobe-experience-platform',
                      name: 'adobe-experience-platform',
                      tagImage: '',
                      title: 'Adobe Experience Platform',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'b2b-marketing-and-abm': {
                      path: '/content/cq:tags/caas/events/summit/track/b2b-marketing-and-abm',
                      tagID: 'caas:events/summit/track/b2b-marketing-and-abm',
                      name: 'b2b-marketing-and-abm',
                      tagImage: '',
                      title: 'B2B Marketing and ABM',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'campaign-management': {
                      path: '/content/cq:tags/caas/events/summit/track/campaign-management',
                      tagID: 'caas:events/summit/track/campaign-management',
                      name: 'campaign-management',
                      tagImage: '',
                      title: 'Campaign Management',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'collaborative-work-management': {
                      path: '/content/cq:tags/caas/events/summit/track/collaborative-work-management',
                      tagID: 'caas:events/summit/track/collaborative-work-management',
                      name: 'collaborative-work-management',
                      tagImage: '',
                      title: 'Collaborative Work Management',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'content-creation': {
                      path: '/content/cq:tags/caas/events/summit/track/content-creation',
                      tagID: 'caas:events/summit/track/content-creation',
                      name: 'content-creation',
                      tagImage: '',
                      title: 'Content Creation',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'developer-ecosystem': {
                      path: '/content/cq:tags/caas/events/summit/track/developer-ecosystem',
                      tagID: 'caas:events/summit/track/developer-ecosystem',
                      name: 'developer-ecosystem',
                      tagImage: '',
                      title: 'Developer Ecosystem',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'digital-commerce': {
                      path: '/content/cq:tags/caas/events/summit/track/digital-commerce',
                      tagID: 'caas:events/summit/track/digital-commerce',
                      name: 'digital-commerce',
                      tagImage: '',
                      title: 'Digital Commerce',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'digital-document-productivity': {
                      path: '/content/cq:tags/caas/events/summit/track/digital-document-productivity',
                      tagID: 'caas:events/summit/track/digital-document-productivity',
                      name: 'digital-document-productivity',
                      tagImage: '',
                      title: 'Digital Document Productivity',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    personalization: {
                      path: '/content/cq:tags/caas/events/summit/track/personalization',
                      tagID: 'caas:events/summit/track/personalization',
                      name: 'personalization',
                      tagImage: '',
                      title: 'Personalization',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'trends-and-inspiration': {
                      path: '/content/cq:tags/caas/events/summit/track/trends-and-inspiration',
                      tagID: 'caas:events/summit/track/trends-and-inspiration',
                      name: 'trends-and-inspiration',
                      tagImage: '',
                      title: 'Trends and Inspiration',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'content-management-personalized-experiences': {
                      path: '/content/cq:tags/caas/events/summit/track/content-management-personalized-experiences',
                      tagID: 'caas:events/summit/track/content-management-personalized-experiences',
                      name: 'content-management-personalized-experiences',
                      tagImage: '',
                      title: 'Content Management for Personalized Experiences',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'customer-data-management': {
                      path: '/content/cq:tags/caas/events/summit/track/customer-data-management',
                      tagID: 'caas:events/summit/track/customer-data-management',
                      name: 'customer-data-management',
                      tagImage: '',
                      title: 'Customer Data Management',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'omnichannel-marketing-optimization': {
                      path: '/content/cq:tags/caas/events/summit/track/omnichannel-marketing-optimization',
                      tagID: 'caas:events/summit/track/omnichannel-marketing-optimization',
                      name: 'omnichannel-marketing-optimization',
                      tagImage: '',
                      title: 'Omnichannel Marketing and Optimization',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'analytics-insights-activation': {
                      path: '/content/cq:tags/caas/events/summit/track/analytics-insights-activation',
                      tagID: 'caas:events/summit/track/analytics-insights-activation',
                      name: 'analytics-insights-activation',
                      tagImage: '',
                      title: 'Analytics, Insights, and Activation',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'analytics-customer-journeys': {
                      path: '/content/cq:tags/caas/events/summit/track/analytics-customer-journeys',
                      tagID: 'caas:events/summit/track/analytics-customer-journeys',
                      name: 'analytics-customer-journeys',
                      tagImage: '',
                      title: 'Analytics for Customer Journeys',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'b2b-marketing': {
                      path: '/content/cq:tags/caas/events/summit/track/b2b-marketing',
                      tagID: 'caas:events/summit/track/b2b-marketing',
                      name: 'b2b-marketing',
                      tagImage: '',
                      title: 'B2B Marketing',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'personalization-at-scale': {
                      path: '/content/cq:tags/caas/events/summit/track/personalization-at-scale',
                      tagID: 'caas:events/summit/track/personalization-at-scale',
                      name: 'personalization-at-scale',
                      tagImage: '',
                      title: 'Personalization at Scale',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'marketing-workflows-collaboration': {
                      path: '/content/cq:tags/caas/events/summit/track/marketing-workflows-collaboration',
                      tagID: 'caas:events/summit/track/marketing-workflows-collaboration',
                      name: 'marketing-workflows-collaboration',
                      tagImage: '',
                      title: 'Marketing Workflows and Collaboration',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'digital-commerce-technology': {
                      path: '/content/cq:tags/caas/events/summit/track/digital-commerce-technology',
                      tagID: 'caas:events/summit/track/digital-commerce-technology',
                      name: 'digital-commerce-technology',
                      tagImage: '',
                      title: 'Digital Commerce Technology',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'content-that-drives-performance': {
                      path: '/content/cq:tags/caas/events/summit/track/content-that-drives-performance',
                      tagID: 'caas:events/summit/track/content-that-drives-performance',
                      name: 'content-that-drives-performance',
                      tagImage: '',
                      title: 'Content that Drives Performance',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'customer-data-management-and-activation': {
                      path: '/content/cq:tags/caas/events/summit/track/customer-data-management-and-activation',
                      tagID: 'caas:events/summit/track/customer-data-management-and-activation',
                      name: 'customer-data-management-and-activation',
                      tagImage: '',
                      title: 'Customer Data Management and Activation',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'commerce-made-personal': {
                      path: '/content/cq:tags/caas/events/summit/track/commerce-made-personal',
                      tagID: 'caas:events/summit/track/commerce-made-personal',
                      name: 'commerce-made-personal',
                      tagImage: '',
                      title: 'Commerce Made Personal',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'personalized-omnichannel-engagement': {
                      path: '/content/cq:tags/caas/events/summit/track/personalized-omnichannel-engagement',
                      tagID: 'caas:events/summit/track/personalized-omnichannel-engagement',
                      name: 'personalized-omnichannel-engagement',
                      tagImage: '',
                      title: 'Personalized Omnichannel Engagement',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'powering-your-digital-business-with-adobe-experience-cloud': {
                      path: '/content/cq:tags/caas/events/summit/track/powering-your-digital-business-with-adobe-experience-cloud',
                      tagID: 'caas:events/summit/track/powering-your-digital-business-with-adobe-experience-cloud',
                      name: 'powering-your-digital-business-with-adobe-experience-cloud',
                      tagImage: '',
                      title: 'Powering your Digital Business with Adobe Experience Cloud',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'content-supply-chain': {
                      path: '/content/cq:tags/caas/events/summit/track/content-supply-chain',
                      tagID: 'caas:events/summit/track/content-supply-chain',
                      name: 'content-supply-chain',
                      tagImage: '',
                      title: 'Content Supply Chain',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    analytics: {
                      path: '/content/cq:tags/caas/events/summit/track/analytics',
                      tagID: 'caas:events/summit/track/analytics',
                      name: 'analytics',
                      tagImage: '',
                      title: 'Analytics',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    commerce: {
                      path: '/content/cq:tags/caas/events/summit/track/commerce',
                      tagID: 'caas:events/summit/track/commerce',
                      name: 'commerce',
                      tagImage: '',
                      title: 'Commerce',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'content-management': {
                      path: '/content/cq:tags/caas/events/summit/track/content-management',
                      tagID: 'caas:events/summit/track/content-management',
                      name: 'content-management',
                      tagImage: '',
                      title: 'Content Management',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'customer-data-management-and-acquisition': {
                      path: '/content/cq:tags/caas/events/summit/track/customer-data-management-and-acquisition',
                      tagID: 'caas:events/summit/track/customer-data-management-and-acquisition',
                      name: 'customer-data-management-and-acquisition',
                      tagImage: '',
                      title: 'Customer Data Management and Acquisition',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'customer-journey-management': {
                      path: '/content/cq:tags/caas/events/summit/track/customer-journey-management',
                      tagID: 'caas:events/summit/track/customer-journey-management',
                      name: 'customer-journey-management',
                      tagImage: '',
                      title: 'Customer Journey Management',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    developers: {
                      path: '/content/cq:tags/caas/events/summit/track/developers',
                      tagID: 'caas:events/summit/track/developers',
                      name: 'developers',
                      tagImage: '',
                      title: 'Developers',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'generative-ai': {
                      path: '/content/cq:tags/caas/events/summit/track/generative-ai',
                      tagID: 'caas:events/summit/track/generative-ai',
                      name: 'generative-ai',
                      tagImage: '',
                      title: 'Generative AI',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'personalized-insights-and-engagement': {
                      path: '/content/cq:tags/caas/events/summit/track/personalized-insights-and-engagement',
                      tagID: 'caas:events/summit/track/personalized-insights-and-engagement',
                      name: 'personalized-insights-and-engagement',
                      tagImage: '',
                      title: 'Personalized Insights and Engagement',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'planning-and-workflow': {
                      path: '/content/cq:tags/caas/events/summit/track/planning-and-workflow',
                      tagID: 'caas:events/summit/track/planning-and-workflow',
                      name: 'planning-and-workflow',
                      tagImage: '',
                      title: 'Planning and Workflow',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                giveaway: {
                  path: '/content/cq:tags/caas/events/summit/giveaway',
                  tagID: 'caas:events/summit/giveaway',
                  name: 'giveaway',
                  tagImage: '',
                  title: 'Giveaway',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    featured: {
                      path: '/content/cq:tags/caas/events/summit/giveaway/featured',
                      tagID: 'caas:events/summit/giveaway/featured',
                      name: 'featured',
                      tagImage: '',
                      title: 'Featured',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    giveaways: {
                      path: '/content/cq:tags/caas/events/summit/giveaway/giveaways',
                      tagID: 'caas:events/summit/giveaway/giveaways',
                      name: 'giveaways',
                      tagImage: '',
                      title: 'Giveaways',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    sweepstakes: {
                      path: '/content/cq:tags/caas/events/summit/giveaway/sweepstakes',
                      tagID: 'caas:events/summit/giveaway/sweepstakes',
                      name: 'sweepstakes',
                      tagImage: '',
                      title: 'Sweepstakes',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    discounts: {
                      path: '/content/cq:tags/caas/events/summit/giveaway/discounts',
                      tagID: 'caas:events/summit/giveaway/discounts',
                      name: 'discounts',
                      tagImage: '',
                      title: 'Discounts',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'free-consultation-demos': {
                      path: '/content/cq:tags/caas/events/summit/giveaway/free-consultation-demos',
                      tagID: 'caas:events/summit/giveaway/free-consultation-demos',
                      name: 'free-consultation-demos',
                      tagImage: '',
                      title: 'Free Consultation Demos',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'free-trials': {
                      path: '/content/cq:tags/caas/events/summit/giveaway/free-trials',
                      tagID: 'caas:events/summit/giveaway/free-trials',
                      name: 'free-trials',
                      tagImage: '',
                      title: 'Free Trials',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'thought-leadership-documents': {
                      path: '/content/cq:tags/caas/events/summit/giveaway/thought-leadership-documents',
                      tagID: 'caas:events/summit/giveaway/thought-leadership-documents',
                      name: 'thought-leadership-documents',
                      tagImage: '',
                      title: 'Thought Leadership Documents',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                'primary-track': {
                  path: '/content/cq:tags/caas/events/summit/primary-track',
                  tagID: 'caas:events/summit/primary-track',
                  name: 'primary-track',
                  tagImage: '',
                  title: 'Primary Track',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'adobe-experience-platform': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/adobe-experience-platform',
                      tagID: 'caas:events/summit/primary-track/adobe-experience-platform',
                      name: 'adobe-experience-platform',
                      tagImage: '',
                      title: 'Adobe Experience Platform',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'b2b-marketing-and-abm': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/b2b-marketing-and-abm',
                      tagID: 'caas:events/summit/primary-track/b2b-marketing-and-abm',
                      name: 'b2b-marketing-and-abm',
                      tagImage: '',
                      title: 'B2B Marketing and ABM',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'campaign-management': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/campaign-management',
                      tagID: 'caas:events/summit/primary-track/campaign-management',
                      name: 'campaign-management',
                      tagImage: '',
                      title: 'Campaign Management',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'collaborative-work-management': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/collaborative-work-management',
                      tagID: 'caas:events/summit/primary-track/collaborative-work-management',
                      name: 'collaborative-work-management',
                      tagImage: '',
                      title: 'Collaborative Work Management',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'content-creation': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/content-creation',
                      tagID: 'caas:events/summit/primary-track/content-creation',
                      name: 'content-creation',
                      tagImage: '',
                      title: 'Content Creation',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'developer-ecosystem': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/developer-ecosystem',
                      tagID: 'caas:events/summit/primary-track/developer-ecosystem',
                      name: 'developer-ecosystem',
                      tagImage: '',
                      title: 'Developer Ecosystem',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'digital-commerce': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/digital-commerce',
                      tagID: 'caas:events/summit/primary-track/digital-commerce',
                      name: 'digital-commerce',
                      tagImage: '',
                      title: 'Digital Commerce',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'digital-document-productivity': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/digital-document-productivity',
                      tagID: 'caas:events/summit/primary-track/digital-document-productivity',
                      name: 'digital-document-productivity',
                      tagImage: '',
                      title: 'Digital Document Productivity',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    personalization: {
                      path: '/content/cq:tags/caas/events/summit/primary-track/personalization',
                      tagID: 'caas:events/summit/primary-track/personalization',
                      name: 'personalization',
                      tagImage: '',
                      title: 'Personalization',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'trends-and-inspiration': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/trends-and-inspiration',
                      tagID: 'caas:events/summit/primary-track/trends-and-inspiration',
                      name: 'trends-and-inspiration',
                      tagImage: '',
                      title: 'Trends and Inspiration',
                      description:
                        'Join fellow CMOs, CIOs, and digital leaders as they discuss generative AI, customer experience, digital trends, leadership, and how a new approach to people, processes, and technology can help drive growth and build customer loyalty.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'analytics-insights-activation': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/analytics-insights-activation',
                      tagID: 'caas:events/summit/primary-track/analytics-insights-activation',
                      name: 'analytics-insights-activation',
                      tagImage: '',
                      title: 'Analytics, Insights, and Activation',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'keynotes-sneaks': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/keynotes-sneaks',
                      tagID: 'caas:events/summit/primary-track/keynotes-sneaks',
                      name: 'keynotes-sneaks',
                      tagImage: '',
                      title: 'Keynotes &amp; Sneaks',
                      description: 'Learn from leading brands, take a sneak peek at what’s new and next from Adobe Labs, and get an exclusive look at Adobe’s vision for experience-led growth.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'analytics-customer-journeys': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/analytics-customer-journeys',
                      tagID: 'caas:events/summit/primary-track/analytics-customer-journeys',
                      name: 'analytics-customer-journeys',
                      tagImage: '',
                      title: 'Analytics for Customer Journeys',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'content-management-personalized-experiences': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/content-management-personalized-experiences',
                      tagID: 'caas:events/summit/primary-track/content-management-personalized-experiences',
                      name: 'content-management-personalized-experiences',
                      tagImage: '',
                      title: 'Content Management for Personalized Experiences',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'customer-data-management': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/customer-data-management',
                      tagID: 'caas:events/summit/primary-track/customer-data-management',
                      name: 'customer-data-management',
                      tagImage: '',
                      title: 'Customer Data Management',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'mainstage-broadcast': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/mainstage-broadcast',
                      tagID: 'caas:events/summit/primary-track/mainstage-broadcast',
                      name: 'mainstage-broadcast',
                      tagImage: '',
                      title: 'Mainstage Broadcast',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'office-hours-live-q-and-a': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/office-hours-live-q-and-a',
                      tagID: 'caas:events/summit/primary-track/office-hours-live-q-and-a',
                      name: 'office-hours-live-q-and-a',
                      tagImage: '',
                      title: 'Office Hours and Live Q&amp;A',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'omnichannel-marketing-optimization': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/omnichannel-marketing-optimization',
                      tagID: 'caas:events/summit/primary-track/omnichannel-marketing-optimization',
                      name: 'omnichannel-marketing-optimization',
                      tagImage: '',
                      title: 'Omnichannel Marketing and Optimization',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'b2b-marketing': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/b2b-marketing',
                      tagID: 'caas:events/summit/primary-track/b2b-marketing',
                      name: 'b2b-marketing',
                      tagImage: '',
                      title: 'B2B Marketing',
                      description:
                        'From the first customer touchpoint, marketing and sales must create a seamless customer journey. Learn how Adobe’s innovation in personalization, automation, and measurement — powered by data and generative AI — help deliver exceptional experiences.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'marketing-workflows-collaboration': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/marketing-workflows-collaboration',
                      tagID: 'caas:events/summit/primary-track/marketing-workflows-collaboration',
                      name: 'marketing-workflows-collaboration',
                      tagImage: '',
                      title: 'Marketing Workflows and Collaboration',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'live-q-and-a-adobe-experts': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/live-q-and-a-adobe-experts',
                      tagID: 'caas:events/summit/primary-track/live-q-and-a-adobe-experts',
                      name: 'live-q-and-a-adobe-experts',
                      tagImage: '',
                      title: 'Live Q&amp;A with Adobe experts',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'personalization-at-scale': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/personalization-at-scale',
                      tagID: 'caas:events/summit/primary-track/personalization-at-scale',
                      name: 'personalization-at-scale',
                      tagImage: '',
                      title: 'Personalization at Scale',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    analytics: {
                      path: '/content/cq:tags/caas/events/summit/primary-track/analytics',
                      tagID: 'caas:events/summit/primary-track/analytics',
                      name: 'analytics',
                      tagImage: '',
                      title: 'Analytics',
                      description:
                        'Customer journeys can take place anywhere, on any device, so having a complete view is critical. Learn how teams across the organization — from analysts to marketers — get complete, real-time customer views across digital and omnichannel journeys.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    commerce: {
                      path: '/content/cq:tags/caas/events/summit/primary-track/commerce',
                      tagID: 'caas:events/summit/primary-track/commerce',
                      name: 'commerce',
                      tagImage: '',
                      title: 'Commerce',
                      description:
                        'Successful companies use data and customer insights to personalize shopping experiences across business models and channels. Discover how to deliver the most impactful end-to-end commerce journeys that increase revenue, productivity, and innovation.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'content-management': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/content-management',
                      tagID: 'caas:events/summit/primary-track/content-management',
                      name: 'content-management',
                      tagImage: '',
                      title: 'Content Management',
                      description:
                        "Achieving content success requires a dual approach: producing it rapidly and ensuring it’s driving engagement through stand-out experiences. Learn how Adobe's unmatched content management tools can help you harness the power of customer experiences.",
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'content-supply-chain': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/content-supply-chain',
                      tagID: 'caas:events/summit/primary-track/content-supply-chain',
                      name: 'content-supply-chain',
                      tagImage: '',
                      title: 'Content Supply Chain',
                      description:
                        'Disconnected teams, disparate tools, and inefficient workflows keep brands from achieving their required content velocity. Learn how to optimize each step of the content supply chain, from workflows, to content creation, to delivery and activation.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'customer-data-management-and-acquisition': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/customer-data-management-and-acquisition',
                      tagID: 'caas:events/summit/primary-track/customer-data-management-and-acquisition',
                      name: 'customer-data-management-and-acquisition',
                      tagImage: '',
                      title: 'Customer Data Management and Acquisition',
                      description:
                        'An integrated approach to customer data is foundational for how data is collected, analyzed, governed, and activated for personalization at scale. Learn how to transform data into impactful customer experiences while maintaining privacy and trust.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'customer-journey-management': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/customer-journey-management',
                      tagID: 'caas:events/summit/primary-track/customer-journey-management',
                      name: 'customer-journey-management',
                      tagImage: '',
                      title: 'Customer Journey Management',
                      description:
                        'Higher-than-ever consumer expectations demand sophisticated customer journeys with real-time, 1:1 personalization across all devices and channels. Explore how Adobe solutions can help you connect data and content to do it all at scale — every time.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'planning-and-workflow': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/planning-and-workflow',
                      tagID: 'caas:events/summit/primary-track/planning-and-workflow',
                      name: 'planning-and-workflow',
                      tagImage: '',
                      title: 'Planning and Workflow',
                      description:
                        'Optimize efficiency and drive critical business outcomes by automating process flows, centralizing programs, enabling collaboration, and aligning execution with objectives to seamlessly connect the way people, projects, and strategy come together.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'generative-ai': {
                      path: '/content/cq:tags/caas/events/summit/primary-track/generative-ai',
                      tagID: 'caas:events/summit/primary-track/generative-ai',
                      name: 'generative-ai',
                      tagImage: '',
                      title: 'Generative AI',
                      description:
                        'Delve into the critical role of Adobe Sensei GenAI — learn how it empowers marketers to work more efficiently, generate content optimized for key business objectives, and maximize ROI with the seamless delivery of personalized experiences at scale.',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
              },
            },
            'technical-level': {
              path: '/content/cq:tags/caas/events/technical-level',
              tagID: 'caas:events/technical-level',
              name: 'technical-level',
              tagImage: '',
              title: 'Technical Level',
              'title.ja': '難易度',
              description: '',
              'cq:movedTo': '',
              tags: {
                intermediate: {
                  path: '/content/cq:tags/caas/events/technical-level/intermediate',
                  tagID: 'caas:events/technical-level/intermediate',
                  name: 'intermediate',
                  tagImage: '',
                  title: 'Intermediate',
                  'title.de': 'Aufsteiger',
                  'title.fr': 'Intermédiaire',
                  'title.ja': '中級',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'general-audience': {
                  path: '/content/cq:tags/caas/events/technical-level/general-audience',
                  tagID: 'caas:events/technical-level/general-audience',
                  name: 'general-audience',
                  tagImage: '',
                  title: 'General Audience',
                  'title.de': 'Allgemeines Publikum',
                  'title.fr': 'Grand public',
                  'title.ja': '一般',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                beginner: {
                  path: '/content/cq:tags/caas/events/technical-level/beginner',
                  tagID: 'caas:events/technical-level/beginner',
                  name: 'beginner',
                  tagImage: '',
                  title: 'Beginner',
                  'title.de': 'Einsteiger',
                  'title.fr': 'Débutant',
                  'title.ja': '初級',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                advanced: {
                  path: '/content/cq:tags/caas/events/technical-level/advanced',
                  tagID: 'caas:events/technical-level/advanced',
                  name: 'advanced',
                  tagImage: '',
                  title: 'Advanced',
                  'title.de': 'Fortgeschrittene',
                  'title.fr': 'Avancé',
                  'title.ja': '上級',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'beginner-to-intermediate': {
                  path: '/content/cq:tags/caas/events/technical-level/beginner-to-intermediate',
                  tagID: 'caas:events/technical-level/beginner-to-intermediate',
                  name: 'beginner-to-intermediate',
                  tagImage: '',
                  title: 'Beginner to Intermediate',
                  'title.ja': '初級～中級',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'intermediate-to-advanced': {
                  path: '/content/cq:tags/caas/events/technical-level/intermediate-to-advanced',
                  tagID: 'caas:events/technical-level/intermediate-to-advanced',
                  name: 'intermediate-to-advanced',
                  tagImage: '',
                  title: 'Intermediate to Advanced',
                  'title.ja': '中級～上級',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            'audience-type': {
              path: '/content/cq:tags/caas/events/audience-type',
              tagID: 'caas:events/audience-type',
              name: 'audience-type',
              tagImage: '',
              title: 'Audience Type',
              'title.ja': '対象者',
              description: '',
              'cq:movedTo': '',
              tags: {
                illustrator: {
                  path: '/content/cq:tags/caas/events/audience-type/illustrator',
                  tagID: 'caas:events/audience-type/illustrator',
                  name: 'illustrator',
                  tagImage: '',
                  title: 'Illustrator',
                  'title.de': 'IllustratorInnen',
                  'title.fr': 'Illustrateur',
                  'title.ja': 'イラストレーター',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                marketer: {
                  path: '/content/cq:tags/caas/events/audience-type/marketer',
                  tagID: 'caas:events/audience-type/marketer',
                  name: 'marketer',
                  tagImage: '',
                  title: 'Marketer',
                  'title.de': 'Marketing- ExpertInnen',
                  'title.fr': 'Responsable marketing',
                  'title.ja': 'マーケター',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                photographer: {
                  path: '/content/cq:tags/caas/events/audience-type/photographer',
                  tagID: 'caas:events/audience-type/photographer',
                  name: 'photographer',
                  tagImage: '',
                  title: 'Photographer',
                  'title.de': 'FotografInnen',
                  'title.fr': 'Photographe',
                  'title.ja': '写真家',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'print-designer': {
                  path: '/content/cq:tags/caas/events/audience-type/print-designer',
                  tagID: 'caas:events/audience-type/print-designer',
                  name: 'print-designer',
                  tagImage: '',
                  title: 'Print Designer',
                  'title.de': 'Druck-Designer',
                  'title.fr': "Designer pour l'impression",
                  'title.ja': '印刷物デザイナー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'ui-and-ux': {
                  path: '/content/cq:tags/caas/events/audience-type/ui-and-ux',
                  tagID: 'caas:events/audience-type/ui-and-ux',
                  name: 'ui-and-ux',
                  tagImage: '',
                  title: 'UI &amp; UX',
                  'title.de': 'UI & UX DesignerInnen',
                  'title.fr': 'UI et UX',
                  'title.ja': 'UI & UX',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                government: {
                  path: '/content/cq:tags/caas/events/audience-type/government',
                  tagID: 'caas:events/audience-type/government',
                  name: 'government',
                  tagImage: '',
                  title: 'Government',
                  'title.de': 'Behörden',
                  'title.fr': 'Administration',
                  'title.ja': '公務員',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'front-end-developer': {
                  path: '/content/cq:tags/caas/events/audience-type/front-end-developer',
                  tagID: 'caas:events/audience-type/front-end-developer',
                  name: 'front-end-developer',
                  tagImage: '',
                  title: 'Front End Developer',
                  'title.de': 'Frontend EntwicklerInnen',
                  'title.fr': 'Développeur front-end',
                  'title.ja': 'フロントエンド開発者',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                educator: {
                  path: '/content/cq:tags/caas/events/audience-type/educator',
                  tagID: 'caas:events/audience-type/educator',
                  name: 'educator',
                  tagImage: '',
                  title: 'Educator',
                  'title.de': 'PädagogInnen',
                  'title.fr': 'Enseignant',
                  'title.ja': '教職員',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'art-creative-director': {
                  path: '/content/cq:tags/caas/events/audience-type/art-creative-director',
                  tagID: 'caas:events/audience-type/art-creative-director',
                  name: 'art-creative-director',
                  tagImage: '',
                  title: 'Art Creative Director',
                  'title.de': 'Art & Creative Director',
                  'title.fr': 'Directeur artistique/de création',
                  'title.ja': 'アート／クリエイティブディレクター',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'web-designer': {
                  path: '/content/cq:tags/caas/events/audience-type/web-designer',
                  tagID: 'caas:events/audience-type/web-designer',
                  name: 'web-designer',
                  tagImage: '',
                  title: 'Web Designer',
                  'title.de': 'WebdesignerInnen',
                  'title.fr': 'Web designer',
                  'title.ja': 'webデザイナー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'social-media-content-creator': {
                  path: '/content/cq:tags/caas/events/audience-type/social-media-content-creator',
                  tagID: 'caas:events/audience-type/social-media-content-creator',
                  name: 'social-media-content-creator',
                  tagImage: '',
                  title: 'Social Media Content Creator',
                  'title.de': 'Autor für Social Media',
                  'title.fr': 'Créateur de contenus pour les réseaux sociaux',
                  'title.ja': 'ソーシャルメディアコンテンツのクリエイター',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'post-production-professional': {
                  path: '/content/cq:tags/caas/events/audience-type/post-production-professional',
                  tagID: 'caas:events/audience-type/post-production-professional',
                  name: 'post-production-professional',
                  tagImage: '',
                  title: 'Post-Production Professional',
                  'title.de': 'Post-Production Profis',
                  'title.fr': 'Professionnel de la postproduction',
                  'title.ja': 'ポスプロ',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'motion-graphics-visual-effects-artist': {
                  path: '/content/cq:tags/caas/events/audience-type/motion-graphics-visual-effects-artist',
                  tagID: 'caas:events/audience-type/motion-graphics-visual-effects-artist',
                  name: 'motion-graphics-visual-effects-artist',
                  tagImage: '',
                  title: 'Motion Graphics Visual Effects Artist',
                  'title.de': 'Motion Graphics & Visual Effects Artists',
                  'title.fr': "Spécialiste de l'animation graphique/créateur d'effets spéciaux",
                  'title.ja': 'モーショングラフィックス/ビジュアルエフェクト',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                it: {
                  path: '/content/cq:tags/caas/events/audience-type/it',
                  tagID: 'caas:events/audience-type/it',
                  name: 'it',
                  tagImage: '',
                  title: 'IT',
                  'title.de': 'IT',
                  'title.fr': 'IT',
                  'title.ja': 'IT関連職',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'graphic-designer': {
                  path: '/content/cq:tags/caas/events/audience-type/graphic-designer',
                  tagID: 'caas:events/audience-type/graphic-designer',
                  name: 'graphic-designer',
                  tagImage: '',
                  title: 'Graphic Designer',
                  'title.de': 'GrafikdesignerInnen',
                  'title.fr': 'Graphiste',
                  'title.ja': 'グラフィックデザイナー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'game-developer': {
                  path: '/content/cq:tags/caas/events/audience-type/game-developer',
                  tagID: 'caas:events/audience-type/game-developer',
                  name: 'game-developer',
                  tagImage: '',
                  title: 'Game Developer',
                  'title.de': 'Spiele- EntwicklerInnen',
                  'title.fr': 'Développeur de jeux',
                  'title.ja': 'ゲーム開発者 ',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                executive: {
                  path: '/content/cq:tags/caas/events/audience-type/executive',
                  tagID: 'caas:events/audience-type/executive',
                  name: 'executive',
                  tagImage: '',
                  title: 'Executive',
                  'title.de': 'Führungskräfte',
                  'title.fr': 'Cadre',
                  'title.ja': '経営者',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'business-strategist-owner': {
                  path: '/content/cq:tags/caas/events/audience-type/business-strategist-owner',
                  tagID: 'caas:events/audience-type/business-strategist-owner',
                  name: 'business-strategist-owner',
                  tagImage: '',
                  title: 'Business Strategist Owner',
                  'title.de': 'Geschäftsführung',
                  'title.fr': "Stratège métier/chef d'entreprise",
                  'title.ja': '事業戦略家／ビジネスオーナー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                '3d': {
                  path: '/content/cq:tags/caas/events/audience-type/3d',
                  tagID: 'caas:events/audience-type/3d',
                  name: '3d',
                  tagImage: '',
                  title: '3D',
                  'title.de': '3D-KünsterInnen',
                  'title.fr': '3D',
                  'title.ja': '3D',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                advertiser: {
                  path: '/content/cq:tags/caas/events/audience-type/advertiser',
                  tagID: 'caas:events/audience-type/advertiser',
                  name: 'advertiser',
                  tagImage: '',
                  title: 'Advertiser',
                  'title.ja': '広告主',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'audience-strategist': {
                  path: '/content/cq:tags/caas/events/audience-type/audience-strategist',
                  tagID: 'caas:events/audience-type/audience-strategist',
                  name: 'audience-strategist',
                  tagImage: '',
                  title: 'Audience Strategist',
                  'title.ja': 'オーディエンスストラテジスト',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'business-analyst': {
                  path: '/content/cq:tags/caas/events/audience-type/business-analyst',
                  tagID: 'caas:events/audience-type/business-analyst',
                  name: 'business-analyst',
                  tagImage: '',
                  title: 'Business Analyst',
                  'title.ja': 'ビジネスアナリスト',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'campaign-manager': {
                  path: '/content/cq:tags/caas/events/audience-type/campaign-manager',
                  tagID: 'caas:events/audience-type/campaign-manager',
                  name: 'campaign-manager',
                  tagImage: '',
                  title: 'Campaign Manager',
                  'title.ja': 'キャンペーンマネージャー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'channel-marketer': {
                  path: '/content/cq:tags/caas/events/audience-type/channel-marketer',
                  tagID: 'caas:events/audience-type/channel-marketer',
                  name: 'channel-marketer',
                  tagImage: '',
                  title: 'Channel Marketer',
                  'title.ja': 'チャネルマーケティング担当者',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'commerce-executive': {
                  path: '/content/cq:tags/caas/events/audience-type/commerce-executive',
                  tagID: 'caas:events/audience-type/commerce-executive',
                  name: 'commerce-executive',
                  tagImage: '',
                  title: 'Commerce Executive',
                  'title.ja': 'コマース担当役員',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'commerce-marketer': {
                  path: '/content/cq:tags/caas/events/audience-type/commerce-marketer',
                  tagID: 'caas:events/audience-type/commerce-marketer',
                  name: 'commerce-marketer',
                  tagImage: '',
                  title: 'Commerce Marketer',
                  'title.ja': 'コマースマーケティング担当者',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'creative-leader': {
                  path: '/content/cq:tags/caas/events/audience-type/creative-leader',
                  tagID: 'caas:events/audience-type/creative-leader',
                  name: 'creative-leader',
                  tagImage: '',
                  title: 'Creative Leader',
                  'title.ja': 'クリエイティブリーダー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'data-scientist': {
                  path: '/content/cq:tags/caas/events/audience-type/data-scientist',
                  tagID: 'caas:events/audience-type/data-scientist',
                  name: 'data-scientist',
                  tagImage: '',
                  title: 'Data Scientist',
                  'title.ja': 'データサイエンティスト',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'database-marketing-manager': {
                  path: '/content/cq:tags/caas/events/audience-type/database-marketing-manager',
                  tagID: 'caas:events/audience-type/database-marketing-manager',
                  name: 'database-marketing-manager',
                  tagImage: '',
                  title: 'Database Marketing Manager',
                  'title.ja': 'データベースマーケティングマネージャー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                developer: {
                  path: '/content/cq:tags/caas/events/audience-type/developer',
                  tagID: 'caas:events/audience-type/developer',
                  name: 'developer',
                  tagImage: '',
                  title: 'Developer',
                  'title.ja': 'デベロッパー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'digital-analyst': {
                  path: '/content/cq:tags/caas/events/audience-type/digital-analyst',
                  tagID: 'caas:events/audience-type/digital-analyst',
                  name: 'digital-analyst',
                  tagImage: '',
                  title: 'Digital Analyst',
                  'title.ja': 'デジタルアナリスト',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'digital-marketer': {
                  path: '/content/cq:tags/caas/events/audience-type/digital-marketer',
                  tagID: 'caas:events/audience-type/digital-marketer',
                  name: 'digital-marketer',
                  tagImage: '',
                  title: 'Digital Marketer',
                  'title.ja': 'デジタルマーケティング担当者',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'email-marketer': {
                  path: '/content/cq:tags/caas/events/audience-type/email-marketer',
                  tagID: 'caas:events/audience-type/email-marketer',
                  name: 'email-marketer',
                  tagImage: '',
                  title: 'Email Marketer',
                  'title.ja': '電子メールマーケティング担当者',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'it-architect': {
                  path: '/content/cq:tags/caas/events/audience-type/it-architect',
                  tagID: 'caas:events/audience-type/it-architect',
                  name: 'it-architect',
                  tagImage: '',
                  title: 'IT Architect',
                  'title.ja': 'ITアーキテクト',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'it-executive': {
                  path: '/content/cq:tags/caas/events/audience-type/it-executive',
                  tagID: 'caas:events/audience-type/it-executive',
                  name: 'it-executive',
                  tagImage: '',
                  title: 'IT Executive',
                  'title.ja': 'IT担当役員',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'marketing-executive': {
                  path: '/content/cq:tags/caas/events/audience-type/marketing-executive',
                  tagID: 'caas:events/audience-type/marketing-executive',
                  name: 'marketing-executive',
                  tagImage: '',
                  title: 'Marketing Executive',
                  'title.ja': 'マーケティング担当役員',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'mobile-marketer': {
                  path: '/content/cq:tags/caas/events/audience-type/mobile-marketer',
                  tagID: 'caas:events/audience-type/mobile-marketer',
                  name: 'mobile-marketer',
                  tagImage: '',
                  title: 'Mobile Marketer',
                  'title.ja': 'モバイルマーケティング担当者',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'operations-coo': {
                  path: '/content/cq:tags/caas/events/audience-type/operations-coo',
                  tagID: 'caas:events/audience-type/operations-coo',
                  name: 'operations-coo',
                  tagImage: '',
                  title: 'Operations &amp; COO',
                  'title.ja': '業務責任者／COO',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'optimization-manager': {
                  path: '/content/cq:tags/caas/events/audience-type/optimization-manager',
                  tagID: 'caas:events/audience-type/optimization-manager',
                  name: 'optimization-manager',
                  tagImage: '',
                  title: 'Optimization Manager',
                  'title.ja': '業務最適化マネージャー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                publisher: {
                  path: '/content/cq:tags/caas/events/audience-type/publisher',
                  tagID: 'caas:events/audience-type/publisher',
                  name: 'publisher',
                  tagImage: '',
                  title: 'Publisher',
                  'title.ja': 'パブリッシャー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'project-manager': {
                  path: '/content/cq:tags/caas/events/audience-type/project-manager',
                  tagID: 'caas:events/audience-type/project-manager',
                  name: 'project-manager',
                  tagImage: '',
                  title: 'Project Manager',
                  'title.ja': 'プロジェクトマネージャー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'segmentation-specialist': {
                  path: '/content/cq:tags/caas/events/audience-type/segmentation-specialist',
                  tagID: 'caas:events/audience-type/segmentation-specialist',
                  name: 'segmentation-specialist',
                  tagImage: '',
                  title: 'Segmentation Specialist',
                  'title.ja': 'セグメンテーションスペシャリスト',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'social-marketer': {
                  path: '/content/cq:tags/caas/events/audience-type/social-marketer',
                  tagID: 'caas:events/audience-type/social-marketer',
                  name: 'social-marketer',
                  tagImage: '',
                  title: 'Social Marketer',
                  'title.ja': 'ソーシャルマーケティング担当者',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'ux-ui-web-designer': {
                  path: '/content/cq:tags/caas/events/audience-type/ux-ui-web-designer',
                  tagID: 'caas:events/audience-type/ux-ui-web-designer',
                  name: 'ux-ui-web-designer',
                  tagImage: '',
                  title: 'UX &amp; UI Web Designer',
                  'title.ja': 'UI／UX／webデザイナー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'web-analyst': {
                  path: '/content/cq:tags/caas/events/audience-type/web-analyst',
                  tagID: 'caas:events/audience-type/web-analyst',
                  name: 'web-analyst',
                  tagImage: '',
                  title: 'Web Analyst',
                  'title.ja': 'Webアナリスト',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'web-marketer': {
                  path: '/content/cq:tags/caas/events/audience-type/web-marketer',
                  tagID: 'caas:events/audience-type/web-marketer',
                  name: 'web-marketer',
                  tagImage: '',
                  title: 'Web Marketer',
                  'title.ja': 'Webマーケティング担当者',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'content-marketer': {
                  path: '/content/cq:tags/caas/events/audience-type/content-marketer',
                  tagID: 'caas:events/audience-type/content-marketer',
                  name: 'content-marketer',
                  tagImage: '',
                  title: 'Content Marketer',
                  'title.ja': 'コンテンツマーケティング担当者',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'motion-design': {
                  path: '/content/cq:tags/caas/events/audience-type/motion-design',
                  tagID: 'caas:events/audience-type/motion-design',
                  name: 'motion-design',
                  tagImage: '',
                  title: 'Motion Design',
                  'title.ja': 'モーションデザイン',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'product-manager': {
                  path: '/content/cq:tags/caas/events/audience-type/product-manager',
                  tagID: 'caas:events/audience-type/product-manager',
                  name: 'product-manager',
                  tagImage: '',
                  title: 'Product Manager',
                  'title.ja': 'プロダクトマネージャー',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'commerce-marketer-merchandiser': {
                  path: '/content/cq:tags/caas/events/audience-type/commerce-marketer-merchandiser',
                  tagID: 'caas:events/audience-type/commerce-marketer-merchandiser',
                  name: 'commerce-marketer-merchandiser',
                  tagImage: '',
                  title: 'Commerce Marketer or Merchandiser',
                  'title.ja': 'コマースマーケティング担当者または小売業者',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                operation: {
                  path: '/content/cq:tags/caas/events/audience-type/operation',
                  tagID: 'caas:events/audience-type/operation',
                  name: 'operation',
                  tagImage: '',
                  title: 'Operation',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'marketing-analyst': {
                  path: '/content/cq:tags/caas/events/audience-type/marketing-analyst',
                  tagID: 'caas:events/audience-type/marketing-analyst',
                  name: 'marketing-analyst',
                  tagImage: '',
                  title: 'Marketing Analyst',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'marketing-operations-manager': {
                  path: '/content/cq:tags/caas/events/audience-type/marketing-operations-manager',
                  tagID: 'caas:events/audience-type/marketing-operations-manager',
                  name: 'marketing-operations-manager',
                  tagImage: '',
                  title: 'Marketing Operations Manager',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'media-planner': {
                  path: '/content/cq:tags/caas/events/audience-type/media-planner',
                  tagID: 'caas:events/audience-type/media-planner',
                  name: 'media-planner',
                  tagImage: '',
                  title: 'Media Planner',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'it-practitioner': {
                  path: '/content/cq:tags/caas/events/audience-type/it-practitioner',
                  tagID: 'caas:events/audience-type/it-practitioner',
                  name: 'it-practitioner',
                  tagImage: '',
                  title: 'IT Practitioner',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'marketing-practitioner': {
                  path: '/content/cq:tags/caas/events/audience-type/marketing-practitioner',
                  tagID: 'caas:events/audience-type/marketing-practitioner',
                  name: 'marketing-practitioner',
                  tagImage: '',
                  title: 'Marketing Practitioner',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'operations-executive': {
                  path: '/content/cq:tags/caas/events/audience-type/operations-executive',
                  tagID: 'caas:events/audience-type/operations-executive',
                  name: 'operations-executive',
                  tagImage: '',
                  title: 'Operations Executive',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'business-decision-maker': {
                  path: '/content/cq:tags/caas/events/audience-type/business-decision-maker',
                  tagID: 'caas:events/audience-type/business-decision-maker',
                  name: 'business-decision-maker',
                  tagImage: '',
                  title: 'Business Decision Maker',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'business-development-representative': {
                  path: '/content/cq:tags/caas/events/audience-type/business-development-representative',
                  tagID: 'caas:events/audience-type/business-development-representative',
                  name: 'business-development-representative',
                  tagImage: '',
                  title: 'Business Development Representative',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'commerce-professional': {
                  path: '/content/cq:tags/caas/events/audience-type/commerce-professional',
                  tagID: 'caas:events/audience-type/commerce-professional',
                  name: 'commerce-professional',
                  tagImage: '',
                  title: 'Commerce Professional',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'content-manager': {
                  path: '/content/cq:tags/caas/events/audience-type/content-manager',
                  tagID: 'caas:events/audience-type/content-manager',
                  name: 'content-manager',
                  tagImage: '',
                  title: 'Content Manager',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'data-practitioner': {
                  path: '/content/cq:tags/caas/events/audience-type/data-practitioner',
                  tagID: 'caas:events/audience-type/data-practitioner',
                  name: 'data-practitioner',
                  tagImage: '',
                  title: 'Data Practitioner',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                designer: {
                  path: '/content/cq:tags/caas/events/audience-type/designer',
                  tagID: 'caas:events/audience-type/designer',
                  name: 'designer',
                  tagImage: '',
                  title: 'Designer',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'email-manager': {
                  path: '/content/cq:tags/caas/events/audience-type/email-manager',
                  tagID: 'caas:events/audience-type/email-manager',
                  name: 'email-manager',
                  tagImage: '',
                  title: 'Email Manager',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'it-professional': {
                  path: '/content/cq:tags/caas/events/audience-type/it-professional',
                  tagID: 'caas:events/audience-type/it-professional',
                  name: 'it-professional',
                  tagImage: '',
                  title: 'IT Professional',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'marketing-operations': {
                  path: '/content/cq:tags/caas/events/audience-type/marketing-operations',
                  tagID: 'caas:events/audience-type/marketing-operations',
                  name: 'marketing-operations',
                  tagImage: '',
                  title: 'Marketing Operations',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'marketing-technologist': {
                  path: '/content/cq:tags/caas/events/audience-type/marketing-technologist',
                  tagID: 'caas:events/audience-type/marketing-technologist',
                  name: 'marketing-technologist',
                  tagImage: '',
                  title: 'Marketing Technologist',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'omnichannel-architect': {
                  path: '/content/cq:tags/caas/events/audience-type/omnichannel-architect',
                  tagID: 'caas:events/audience-type/omnichannel-architect',
                  name: 'omnichannel-architect',
                  tagImage: '',
                  title: 'Omnichannel Architect',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'operations-professional': {
                  path: '/content/cq:tags/caas/events/audience-type/operations-professional',
                  tagID: 'caas:events/audience-type/operations-professional',
                  name: 'operations-professional',
                  tagImage: '',
                  title: 'Operations Professional',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'people-manager': {
                  path: '/content/cq:tags/caas/events/audience-type/people-manager',
                  tagID: 'caas:events/audience-type/people-manager',
                  name: 'people-manager',
                  tagImage: '',
                  title: 'People Manager',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'social-strategist': {
                  path: '/content/cq:tags/caas/events/audience-type/social-strategist',
                  tagID: 'caas:events/audience-type/social-strategist',
                  name: 'social-strategist',
                  tagImage: '',
                  title: 'Social Strategist',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'legal-privacy-officer': {
                  path: '/content/cq:tags/caas/events/audience-type/legal-privacy-officer',
                  tagID: 'caas:events/audience-type/legal-privacy-officer',
                  name: 'legal-privacy-officer',
                  tagImage: '',
                  title: 'Legal or Privacy Officer',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'project-program-manager': {
                  path: '/content/cq:tags/caas/events/audience-type/project-program-manager',
                  tagID: 'caas:events/audience-type/project-program-manager',
                  name: 'project-program-manager',
                  tagImage: '',
                  title: 'Project or Program Manager',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            products: {
              path: '/content/cq:tags/caas/events/products',
              tagID: 'caas:events/products',
              name: 'products',
              tagImage: '',
              title: 'Products',
              'title.ja': '製品',
              description: '',
              'cq:movedTo': '',
              tags: {
                acrobat: {
                  path: '/content/cq:tags/caas/events/products/acrobat',
                  tagID: 'caas:events/products/acrobat',
                  name: 'acrobat',
                  tagImage: '',
                  title: 'Acrobat',
                  'title.ja': 'Acrobat',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'after-effects': {
                  path: '/content/cq:tags/caas/events/products/after-effects',
                  tagID: 'caas:events/products/after-effects',
                  name: 'after-effects',
                  tagImage: '',
                  title: 'After Effects',
                  'title.ja': 'After Effects',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                audition: {
                  path: '/content/cq:tags/caas/events/products/audition',
                  tagID: 'caas:events/products/audition',
                  name: 'audition',
                  tagImage: '',
                  title: 'Audition',
                  'title.ja': 'Audition',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                bridge: {
                  path: '/content/cq:tags/caas/events/products/bridge',
                  tagID: 'caas:events/products/bridge',
                  name: 'bridge',
                  tagImage: '',
                  title: 'Bridge',
                  'title.ja': 'Bridge',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'character-animator': {
                  path: '/content/cq:tags/caas/events/products/character-animator',
                  tagID: 'caas:events/products/character-animator',
                  name: 'character-animator',
                  tagImage: '',
                  title: 'Character Animator',
                  'title.ja': 'Character Animator',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                dimension: {
                  path: '/content/cq:tags/caas/events/products/dimension',
                  tagID: 'caas:events/products/dimension',
                  name: 'dimension',
                  tagImage: '',
                  title: 'Dimension',
                  'title.ja': 'Dimension',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-fresco': {
                  path: '/content/cq:tags/caas/events/products/adobe-fresco',
                  tagID: 'caas:events/products/adobe-fresco',
                  name: 'adobe-fresco',
                  tagImage: '',
                  title: 'Adobe Fresco',
                  'title.ja': 'Adobe Fresco',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                indesign: {
                  path: '/content/cq:tags/caas/events/products/indesign',
                  tagID: 'caas:events/products/indesign',
                  name: 'indesign',
                  tagImage: '',
                  title: 'InDesign',
                  'title.ja': 'InDesign',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'lightroom-classic': {
                  path: '/content/cq:tags/caas/events/products/lightroom-classic',
                  tagID: 'caas:events/products/lightroom-classic',
                  name: 'lightroom-classic',
                  tagImage: '',
                  title: 'Lightroom Classic',
                  'title.ja': 'Lightroom Classic',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'medium-by-adobe': {
                  path: '/content/cq:tags/caas/events/products/medium-by-adobe',
                  tagID: 'caas:events/products/medium-by-adobe',
                  name: 'medium-by-adobe',
                  tagImage: '',
                  title: 'Medium by Adobe',
                  'title.ja': 'Medium by Adobe',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'pdf-sdk': {
                  path: '/content/cq:tags/caas/events/products/pdf-sdk',
                  tagID: 'caas:events/products/pdf-sdk',
                  name: 'pdf-sdk',
                  tagImage: '',
                  title: 'PDF SDK',
                  'title.ja': 'PDF SDK',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'photoshop-camera': {
                  path: '/content/cq:tags/caas/events/products/photoshop-camera',
                  tagID: 'caas:events/products/photoshop-camera',
                  name: 'photoshop-camera',
                  tagImage: '',
                  title: 'Photoshop Camera',
                  'title.ja': 'Photoshop Camera',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'premiere-pro': {
                  path: '/content/cq:tags/caas/events/products/premiere-pro',
                  tagID: 'caas:events/products/premiere-pro',
                  name: 'premiere-pro',
                  tagImage: '',
                  title: 'Premiere Pro',
                  'title.ja': 'Premiere Pro',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                reader: {
                  path: '/content/cq:tags/caas/events/products/reader',
                  tagID: 'caas:events/products/reader',
                  name: 'reader',
                  tagImage: '',
                  title: 'Reader',
                  'title.ja': 'Reader',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-sign': {
                  path: '/content/cq:tags/caas/events/products/adobe-sign',
                  tagID: 'caas:events/products/adobe-sign',
                  name: 'adobe-sign',
                  tagImage: '',
                  title: 'Adobe Sign',
                  'title.ja': 'Adobe Sign',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-stock': {
                  path: '/content/cq:tags/caas/events/products/adobe-stock',
                  tagID: 'caas:events/products/adobe-stock',
                  name: 'adobe-stock',
                  tagImage: '',
                  title: 'Adobe Stock',
                  'title.ja': 'Adobe Stock',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'substance-painter': {
                  path: '/content/cq:tags/caas/events/products/substance-painter',
                  tagID: 'caas:events/products/substance-painter',
                  name: 'substance-painter',
                  tagImage: '',
                  title: 'Substance Painter',
                  'title.ja': 'Substance Painter',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                xd: {
                  path: '/content/cq:tags/caas/events/products/xd',
                  tagID: 'caas:events/products/xd',
                  name: 'xd',
                  tagImage: '',
                  title: 'XD',
                  'title.ja': 'XD',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                aero: {
                  path: '/content/cq:tags/caas/events/products/aero',
                  tagID: 'caas:events/products/aero',
                  name: 'aero',
                  tagImage: '',
                  title: 'Aero',
                  'title.ja': 'Aero',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                animate: {
                  path: '/content/cq:tags/caas/events/products/animate',
                  tagID: 'caas:events/products/animate',
                  name: 'animate',
                  tagImage: '',
                  title: 'Animate',
                  'title.ja': 'Animate',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                behance: {
                  path: '/content/cq:tags/caas/events/products/behance',
                  tagID: 'caas:events/products/behance',
                  name: 'behance',
                  tagImage: '',
                  title: 'Behance',
                  'title.ja': 'Behance',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                capture: {
                  path: '/content/cq:tags/caas/events/products/capture',
                  tagID: 'caas:events/products/capture',
                  name: 'capture',
                  tagImage: '',
                  title: 'Capture',
                  'title.ja': 'Capture',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'creative-cloud': {
                  path: '/content/cq:tags/caas/events/products/creative-cloud',
                  tagID: 'caas:events/products/creative-cloud',
                  name: 'creative-cloud',
                  tagImage: '',
                  title: 'Creative Cloud',
                  'title.ja': 'Creative Cloud',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-fonts': {
                  path: '/content/cq:tags/caas/events/products/adobe-fonts',
                  tagID: 'caas:events/products/adobe-fonts',
                  name: 'adobe-fonts',
                  tagImage: '',
                  title: 'Adobe Fonts',
                  'title.ja': 'Adobe Fonts',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                illustrator: {
                  path: '/content/cq:tags/caas/events/products/illustrator',
                  tagID: 'caas:events/products/illustrator',
                  name: 'illustrator',
                  tagImage: '',
                  title: 'Illustrator',
                  'title.ja': 'Illustrator',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                lightroom: {
                  path: '/content/cq:tags/caas/events/products/lightroom',
                  tagID: 'caas:events/products/lightroom',
                  name: 'lightroom',
                  tagImage: '',
                  title: 'Lightroom',
                  'title.ja': 'Lightroom',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'lightroom-on-mobile': {
                  path: '/content/cq:tags/caas/events/products/lightroom-on-mobile',
                  tagID: 'caas:events/products/lightroom-on-mobile',
                  name: 'lightroom-on-mobile',
                  tagImage: '',
                  title: 'Lightroom on mobile',
                  'title.ja': 'モバイル版Lightroom',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'not-product-specific': {
                  path: '/content/cq:tags/caas/events/products/not-product-specific',
                  tagID: 'caas:events/products/not-product-specific',
                  name: 'not-product-specific',
                  tagImage: '',
                  title: 'Not Product Specific',
                  'title.ja': '特化製品なし',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                photoshop: {
                  path: '/content/cq:tags/caas/events/products/photoshop',
                  tagID: 'caas:events/products/photoshop',
                  name: 'photoshop',
                  tagImage: '',
                  title: 'Photoshop',
                  'title.ja': 'Photoshop',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                portfolio: {
                  path: '/content/cq:tags/caas/events/products/portfolio',
                  tagID: 'caas:events/products/portfolio',
                  name: 'portfolio',
                  tagImage: '',
                  title: 'Portfolio',
                  'title.ja': 'Portfolio',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'premiere-rush': {
                  path: '/content/cq:tags/caas/events/products/premiere-rush',
                  tagID: 'caas:events/products/premiere-rush',
                  name: 'premiere-rush',
                  tagImage: '',
                  title: 'Premiere Rush',
                  'title.ja': 'Premiere Rush',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-scan': {
                  path: '/content/cq:tags/caas/events/products/adobe-scan',
                  tagID: 'caas:events/products/adobe-scan',
                  name: 'adobe-scan',
                  tagImage: '',
                  title: 'Adobe Scan',
                  'title.ja': 'Adobe Scan',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-spark': {
                  path: '/content/cq:tags/caas/events/products/adobe-spark',
                  tagID: 'caas:events/products/adobe-spark',
                  name: 'adobe-spark',
                  tagImage: '',
                  title: 'Adobe Spark',
                  'title.ja': 'Adobe Spark',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'substance-alchemist': {
                  path: '/content/cq:tags/caas/events/products/substance-alchemist',
                  tagID: 'caas:events/products/substance-alchemist',
                  name: 'substance-alchemist',
                  tagImage: '',
                  title: 'Substance Alchemist',
                  'title.ja': 'Substance Alchemist',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'substance-source': {
                  path: '/content/cq:tags/caas/events/products/substance-source',
                  tagID: 'caas:events/products/substance-source',
                  name: 'substance-source',
                  tagImage: '',
                  title: 'Substance Source',
                  'title.ja': 'Substance Source',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'pdf-api': {
                  path: '/content/cq:tags/caas/events/products/pdf-api',
                  tagID: 'caas:events/products/pdf-api',
                  name: 'pdf-api',
                  tagImage: '',
                  title: 'PDF API',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                preview: {
                  path: '/content/cq:tags/caas/events/products/preview',
                  tagID: 'caas:events/products/preview',
                  name: 'preview',
                  tagImage: '',
                  title: 'Preview',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                substance: {
                  path: '/content/cq:tags/caas/events/products/substance',
                  tagID: 'caas:events/products/substance',
                  name: 'substance',
                  tagImage: '',
                  title: 'Substance',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-advertising-cloud': {
                  path: '/content/cq:tags/caas/events/products/adobe-advertising-cloud',
                  tagID: 'caas:events/products/adobe-advertising-cloud',
                  name: 'adobe-advertising-cloud',
                  tagImage: '',
                  title: 'Adobe Advertising Cloud',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-analytics': {
                  path: '/content/cq:tags/caas/events/products/adobe-analytics',
                  tagID: 'caas:events/products/adobe-analytics',
                  name: 'adobe-analytics',
                  tagImage: '',
                  title: 'Adobe Analytics',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-audience-manager': {
                  path: '/content/cq:tags/caas/events/products/adobe-audience-manager',
                  tagID: 'caas:events/products/adobe-audience-manager',
                  name: 'adobe-audience-manager',
                  tagImage: '',
                  title: 'Adobe Audience Manager',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-campaign': {
                  path: '/content/cq:tags/caas/events/products/adobe-campaign',
                  tagID: 'caas:events/products/adobe-campaign',
                  name: 'adobe-campaign',
                  tagImage: '',
                  title: 'Adobe Campaign',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-commerce-cloud': {
                  path: '/content/cq:tags/caas/events/products/adobe-commerce-cloud',
                  tagID: 'caas:events/products/adobe-commerce-cloud',
                  name: 'adobe-commerce-cloud',
                  tagImage: '',
                  title: 'Adobe Commerce Cloud',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-creative-cloud': {
                  path: '/content/cq:tags/caas/events/products/adobe-creative-cloud',
                  tagID: 'caas:events/products/adobe-creative-cloud',
                  name: 'adobe-creative-cloud',
                  tagImage: '',
                  title: 'Adobe Creative Cloud',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-document-cloud': {
                  path: '/content/cq:tags/caas/events/products/adobe-document-cloud',
                  tagID: 'caas:events/products/adobe-document-cloud',
                  name: 'adobe-document-cloud',
                  tagImage: '',
                  title: 'Adobe Document Cloud',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-experience-manager': {
                  path: '/content/cq:tags/caas/events/products/adobe-experience-manager',
                  tagID: 'caas:events/products/adobe-experience-manager',
                  name: 'adobe-experience-manager',
                  tagImage: '',
                  title: 'Adobe Experience Manager',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-experience-cloud': {
                  path: '/content/cq:tags/caas/events/products/adobe-experience-cloud',
                  tagID: 'caas:events/products/adobe-experience-cloud',
                  name: 'adobe-experience-cloud',
                  tagImage: '',
                  title: 'Adobe Experience Cloud',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-experience-platform': {
                  path: '/content/cq:tags/caas/events/products/adobe-experience-platform',
                  tagID: 'caas:events/products/adobe-experience-platform',
                  name: 'adobe-experience-platform',
                  tagImage: '',
                  title: 'Adobe Experience Platform',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-primetime': {
                  path: '/content/cq:tags/caas/events/products/adobe-primetime',
                  tagID: 'caas:events/products/adobe-primetime',
                  name: 'adobe-primetime',
                  tagImage: '',
                  title: 'Adobe Primetime',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-sensei': {
                  path: '/content/cq:tags/caas/events/products/adobe-sensei',
                  tagID: 'caas:events/products/adobe-sensei',
                  name: 'adobe-sensei',
                  tagImage: '',
                  title: 'Adobe Sensei',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-target': {
                  path: '/content/cq:tags/caas/events/products/adobe-target',
                  tagID: 'caas:events/products/adobe-target',
                  name: 'adobe-target',
                  tagImage: '',
                  title: 'Adobe Target',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'magento-business-intelligence': {
                  path: '/content/cq:tags/caas/events/products/magento-business-intelligence',
                  tagID: 'caas:events/products/magento-business-intelligence',
                  name: 'magento-business-intelligence',
                  tagImage: '',
                  title: 'Magento Business Intelligence',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'magento-commerce': {
                  path: '/content/cq:tags/caas/events/products/magento-commerce',
                  tagID: 'caas:events/products/magento-commerce',
                  name: 'magento-commerce',
                  tagImage: '',
                  title: 'Magento Commerce',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'magento-order-management': {
                  path: '/content/cq:tags/caas/events/products/magento-order-management',
                  tagID: 'caas:events/products/magento-order-management',
                  name: 'magento-order-management',
                  tagImage: '',
                  title: 'Magento Order Management',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'marketo-engage-bizible': {
                  path: '/content/cq:tags/caas/events/products/marketo-engage-bizible',
                  tagID: 'caas:events/products/marketo-engage-bizible',
                  name: 'marketo-engage-bizible',
                  tagImage: '',
                  title: 'Marketo Engage &amp; Marketo Measure',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                workfront: {
                  path: '/content/cq:tags/caas/events/products/workfront',
                  tagID: 'caas:events/products/workfront',
                  name: 'workfront',
                  tagImage: '',
                  title: 'Adobe Workfront',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-commerce': {
                  path: '/content/cq:tags/caas/events/products/adobe-commerce',
                  tagID: 'caas:events/products/adobe-commerce',
                  name: 'adobe-commerce',
                  tagImage: '',
                  title: 'Adobe Commerce',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'creative-cloud-libraries': {
                  path: '/content/cq:tags/caas/events/products/creative-cloud-libraries',
                  tagID: 'caas:events/products/creative-cloud-libraries',
                  name: 'creative-cloud-libraries',
                  tagImage: '',
                  title: 'Creative Cloud Libraries',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'premiere-express': {
                  path: '/content/cq:tags/caas/events/products/premiere-express',
                  tagID: 'caas:events/products/premiere-express',
                  name: 'premiere-express',
                  tagImage: '',
                  title: 'Premiere Express',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'substance-3d-assets': {
                  path: '/content/cq:tags/caas/events/products/substance-3d-assets',
                  tagID: 'caas:events/products/substance-3d-assets',
                  name: 'substance-3d-assets',
                  tagImage: '',
                  title: 'Substance 3D Assets',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'substance-3d-designer': {
                  path: '/content/cq:tags/caas/events/products/substance-3d-designer',
                  tagID: 'caas:events/products/substance-3d-designer',
                  name: 'substance-3d-designer',
                  tagImage: '',
                  title: 'Substance 3D Designer',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'substance-3d-modeler': {
                  path: '/content/cq:tags/caas/events/products/substance-3d-modeler',
                  tagID: 'caas:events/products/substance-3d-modeler',
                  name: 'substance-3d-modeler',
                  tagImage: '',
                  title: 'Substance 3D Modeler',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'substance-3d-painter': {
                  path: '/content/cq:tags/caas/events/products/substance-3d-painter',
                  tagID: 'caas:events/products/substance-3d-painter',
                  name: 'substance-3d-painter',
                  tagImage: '',
                  title: 'Substance 3D Painter',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'substance-3d-sampler': {
                  path: '/content/cq:tags/caas/events/products/substance-3d-sampler',
                  tagID: 'caas:events/products/substance-3d-sampler',
                  name: 'substance-3d-sampler',
                  tagImage: '',
                  title: 'Substance 3D Sampler',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'substance-3d-stager': {
                  path: '/content/cq:tags/caas/events/products/substance-3d-stager',
                  tagID: 'caas:events/products/substance-3d-stager',
                  name: 'substance-3d-stager',
                  tagImage: '',
                  title: 'Substance 3D Stager',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'photoshop-express': {
                  path: '/content/cq:tags/caas/events/products/photoshop-express',
                  tagID: 'caas:events/products/photoshop-express',
                  name: 'photoshop-express',
                  tagImage: '',
                  title: 'Photoshop Express',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-customer-journey-analytics': {
                  path: '/content/cq:tags/caas/events/products/adobe-customer-journey-analytics',
                  tagID: 'caas:events/products/adobe-customer-journey-analytics',
                  name: 'adobe-customer-journey-analytics',
                  tagImage: '',
                  title: 'Adobe Customer Journey Analytics',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-journey-optimizer': {
                  path: '/content/cq:tags/caas/events/products/adobe-journey-optimizer',
                  tagID: 'caas:events/products/adobe-journey-optimizer',
                  name: 'adobe-journey-optimizer',
                  tagImage: '',
                  title: 'Adobe Journey Optimizer',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                bizible: {
                  path: '/content/cq:tags/caas/events/products/bizible',
                  tagID: 'caas:events/products/bizible',
                  name: 'bizible',
                  tagImage: '',
                  title: 'Marketo Measure',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'marketo-engage': {
                  path: '/content/cq:tags/caas/events/products/marketo-engage',
                  tagID: 'caas:events/products/marketo-engage',
                  name: 'marketo-engage',
                  tagImage: '',
                  title: 'Adobe Marketo Engage',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                sign: {
                  path: '/content/cq:tags/caas/events/products/sign',
                  tagID: 'caas:events/products/sign',
                  name: 'sign',
                  tagImage: '',
                  title: 'Adobe Sign',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-real-time-cdp': {
                  path: '/content/cq:tags/caas/events/products/adobe-real-time-cdp',
                  tagID: 'caas:events/products/adobe-real-time-cdp',
                  name: 'adobe-real-time-cdp',
                  tagImage: '',
                  title: 'Adobe Real-Time CDP',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-express': {
                  path: '/content/cq:tags/caas/events/products/adobe-express',
                  tagID: 'caas:events/products/adobe-express',
                  name: 'adobe-express',
                  tagImage: '',
                  title: 'Adobe Express',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'frame-io': {
                  path: '/content/cq:tags/caas/events/products/frame-io',
                  tagID: 'caas:events/products/frame-io',
                  name: 'frame-io',
                  tagImage: '',
                  title: 'Frame.io',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'marketo-engage-marketo-measure': {
                  path: '/content/cq:tags/caas/events/products/marketo-engage-marketo-measure',
                  tagID: 'caas:events/products/marketo-engage-marketo-measure',
                  name: 'marketo-engage-marketo-measure',
                  tagImage: '',
                  title: 'Marketo Engage &amp; Marketo Measure',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'marketo-measure': {
                  path: '/content/cq:tags/caas/events/products/marketo-measure',
                  tagID: 'caas:events/products/marketo-measure',
                  name: 'marketo-measure',
                  tagImage: '',
                  title: 'Adobe Marketo Measure',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-primetime-pass': {
                  path: '/content/cq:tags/caas/events/products/adobe-primetime-pass',
                  tagID: 'caas:events/products/adobe-primetime-pass',
                  name: 'adobe-primetime-pass',
                  tagImage: '',
                  title: 'Adobe Primetime Pass',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-real-time-cdp-connections': {
                  path: '/content/cq:tags/caas/events/products/adobe-real-time-cdp-connections',
                  tagID: 'caas:events/products/adobe-real-time-cdp-connections',
                  name: 'adobe-real-time-cdp-connections',
                  tagImage: '',
                  title: 'Adobe Real-Time CDP Connections',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-marketo-measure': {
                  path: '/content/cq:tags/caas/events/products/adobe-marketo-measure',
                  tagID: 'caas:events/products/adobe-marketo-measure',
                  name: 'adobe-marketo-measure',
                  tagImage: '',
                  title: 'Adobe Marketo Measure',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'attribution-ai': {
                  path: '/content/cq:tags/caas/events/products/attribution-ai',
                  tagID: 'caas:events/products/attribution-ai',
                  name: 'attribution-ai',
                  tagImage: '',
                  title: 'Attribution AI',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-learning-manager': {
                  path: '/content/cq:tags/caas/events/products/adobe-learning-manager',
                  tagID: 'caas:events/products/adobe-learning-manager',
                  name: 'adobe-learning-manager',
                  tagImage: '',
                  title: 'Adobe Learning Manager',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'marketing-mix-modeling': {
                  path: '/content/cq:tags/caas/events/products/marketing-mix-modeling',
                  tagID: 'caas:events/products/marketing-mix-modeling',
                  name: 'marketing-mix-modeling',
                  tagImage: '',
                  title: 'Marketing Mix Modeling',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-experience-manager-sites': {
                  path: '/content/cq:tags/caas/events/products/adobe-experience-manager-sites',
                  tagID: 'caas:events/products/adobe-experience-manager-sites',
                  name: 'adobe-experience-manager-sites',
                  tagImage: '',
                  title: 'Adobe Experience Manager Sites',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-experience-manager-forms': {
                  path: '/content/cq:tags/caas/events/products/adobe-experience-manager-forms',
                  tagID: 'caas:events/products/adobe-experience-manager-forms',
                  name: 'adobe-experience-manager-forms',
                  tagImage: '',
                  title: 'Adobe Experience Manager Forms',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-experience-manager-assets': {
                  path: '/content/cq:tags/caas/events/products/adobe-experience-manager-assets',
                  tagID: 'caas:events/products/adobe-experience-manager-assets',
                  name: 'adobe-experience-manager-assets',
                  tagImage: '',
                  title: 'Adobe Experience Manager Assets',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-advertising': {
                  path: '/content/cq:tags/caas/events/products/adobe-advertising',
                  tagID: 'caas:events/products/adobe-advertising',
                  name: 'adobe-advertising',
                  tagImage: '',
                  title: 'Adobe Advertising',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-experience-manager-guides': {
                  path: '/content/cq:tags/caas/events/products/adobe-experience-manager-guides',
                  tagID: 'caas:events/products/adobe-experience-manager-guides',
                  name: 'adobe-experience-manager-guides',
                  tagImage: '',
                  title: 'Adobe Experience Manager Guides',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-firefly': {
                  path: '/content/cq:tags/caas/events/products/adobe-firefly',
                  tagID: 'caas:events/products/adobe-firefly',
                  name: 'adobe-firefly',
                  tagImage: '',
                  title: 'Adobe Firefly',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-dynamic-chat': {
                  path: '/content/cq:tags/caas/events/products/adobe-dynamic-chat',
                  tagID: 'caas:events/products/adobe-dynamic-chat',
                  name: 'adobe-dynamic-chat',
                  tagImage: '',
                  title: 'Adobe Dynamic Chat',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-experience-manager-screens': {
                  path: '/content/cq:tags/caas/events/products/adobe-experience-manager-screens',
                  tagID: 'caas:events/products/adobe-experience-manager-screens',
                  name: 'adobe-experience-manager-screens',
                  tagImage: '',
                  title: 'Adobe Experience Manager Screens',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-gen-studio': {
                  path: '/content/cq:tags/caas/events/products/adobe-gen-studio',
                  tagID: 'caas:events/products/adobe-gen-studio',
                  name: 'adobe-gen-studio',
                  tagImage: '',
                  title: 'Adobe Gen Studio',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-mix-modeler': {
                  path: '/content/cq:tags/caas/events/products/adobe-mix-modeler',
                  tagID: 'caas:events/products/adobe-mix-modeler',
                  name: 'adobe-mix-modeler',
                  tagImage: '',
                  title: 'Adobe Mix Modeler',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'adobe-product-analytics': {
                  path: '/content/cq:tags/caas/events/products/adobe-product-analytics',
                  tagID: 'caas:events/products/adobe-product-analytics',
                  name: 'adobe-product-analytics',
                  tagImage: '',
                  title: 'Adobe Product Analytics',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            region: {
              path: '/content/cq:tags/caas/events/region',
              tagID: 'caas:events/region',
              name: 'region',
              tagImage: '',
              title: 'Region',
              'title.ja': '地域',
              description: '',
              'cq:movedTo': '',
              tags: {
                americas: {
                  path: '/content/cq:tags/caas/events/region/americas',
                  tagID: 'caas:events/region/americas',
                  name: 'americas',
                  tagImage: '',
                  title: 'Americas',
                  'title.ja': '北米、中米、南米',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'asia-pacific': {
                  path: '/content/cq:tags/caas/events/region/asia-pacific',
                  tagID: 'caas:events/region/asia-pacific',
                  name: 'asia-pacific',
                  tagImage: '',
                  title: 'Asia Pacific',
                  'title.ja': 'アジア太平洋地域',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'europe-middle-east-and-africa': {
                  path: '/content/cq:tags/caas/events/region/europe-middle-east-and-africa',
                  tagID: 'caas:events/region/europe-middle-east-and-africa',
                  name: 'europe-middle-east-and-africa',
                  tagImage: '',
                  title: 'Europe, Middle East, and Africa',
                  'title.ja': 'ヨーロッパ、中東、アフリカ',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                japan: {
                  path: '/content/cq:tags/caas/events/region/japan',
                  tagID: 'caas:events/region/japan',
                  name: 'japan',
                  tagImage: '',
                  title: 'Japan',
                  'title.ja': '日本',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'australia-new-zealand': {
                  path: '/content/cq:tags/caas/events/region/australia-new-zealand',
                  tagID: 'caas:events/region/australia-new-zealand',
                  name: 'australia-new-zealand',
                  tagImage: '',
                  title: 'Australia &amp; New Zealand',
                  'title.ja': 'オーストラリア、ニュージーランド',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'asia-india': {
                  path: '/content/cq:tags/caas/events/region/asia-india',
                  tagID: 'caas:events/region/asia-india',
                  name: 'asia-india',
                  tagImage: '',
                  title: 'Asia &amp; India',
                  'title.ja': '東南アジア、インド',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                asia: {
                  path: '/content/cq:tags/caas/events/region/asia',
                  tagID: 'caas:events/region/asia',
                  name: 'asia',
                  tagImage: '',
                  title: 'Asia',
                  'title.ja': 'アジア',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'americas-day-1': {
                  path: '/content/cq:tags/caas/events/region/americas-day-1',
                  tagID: 'caas:events/region/americas-day-1',
                  name: 'americas-day-1',
                  tagImage: '',
                  title: 'Americas Day 1',
                  'title.ja': '南北アメリカ 1日目',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'americas-day-2': {
                  path: '/content/cq:tags/caas/events/region/americas-day-2',
                  tagID: 'caas:events/region/americas-day-2',
                  name: 'americas-day-2',
                  tagImage: '',
                  title: 'Americas Day 2',
                  'title.ja': '南北アメリカ 2日目',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            'business-type': {
              path: '/content/cq:tags/caas/events/business-type',
              tagID: 'caas:events/business-type',
              name: 'business-type',
              tagImage: '',
              title: 'Business Type',
              description: '',
              'cq:movedTo': '',
              tags: {
                b2b: {
                  path: '/content/cq:tags/caas/events/business-type/b2b',
                  tagID: 'caas:events/business-type/b2b',
                  name: 'b2b',
                  tagImage: '',
                  title: 'Business-to-Business',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                b2c: {
                  path: '/content/cq:tags/caas/events/business-type/b2c',
                  tagID: 'caas:events/business-type/b2c',
                  name: 'b2c',
                  tagImage: '',
                  title: 'Business-to-Consumer',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                smb: {
                  path: '/content/cq:tags/caas/events/business-type/smb',
                  tagID: 'caas:events/business-type/smb',
                  name: 'smb',
                  tagImage: '',
                  title: 'Small and Midsize Business',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'large-enterprise': {
                  path: '/content/cq:tags/caas/events/business-type/large-enterprise',
                  tagID: 'caas:events/business-type/large-enterprise',
                  name: 'large-enterprise',
                  tagImage: '',
                  title: 'Large Enterprise',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'business-to-people': {
                  path: '/content/cq:tags/caas/events/business-type/business-to-people',
                  tagID: 'caas:events/business-type/business-to-people',
                  name: 'business-to-people',
                  tagImage: '',
                  title: 'Business-to-People',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            sponsored: {
              path: '/content/cq:tags/caas/events/sponsored',
              tagID: 'caas:events/sponsored',
              name: 'sponsored',
              tagImage: '',
              title: 'Sponsored',
              'title.de': 'Gesponsert',
              'title.fr': 'Parrainé par Adobe',
              'title.ja': 'スポンサー',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            industry: {
              path: '/content/cq:tags/caas/events/industry',
              tagID: 'caas:events/industry',
              name: 'industry',
              tagImage: '',
              title: 'Industry',
              description: '',
              'cq:movedTo': '',
              tags: {
                'advertising-publishing': {
                  path: '/content/cq:tags/caas/events/industry/advertising-publishing',
                  tagID: 'caas:events/industry/advertising-publishing',
                  name: 'advertising-publishing',
                  tagImage: '',
                  title: 'Advertising &amp; Publishing',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                automotive: {
                  path: '/content/cq:tags/caas/events/industry/automotive',
                  tagID: 'caas:events/industry/automotive',
                  name: 'automotive',
                  tagImage: '',
                  title: 'Automotive',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                commerce: {
                  path: '/content/cq:tags/caas/events/industry/commerce',
                  tagID: 'caas:events/industry/commerce',
                  name: 'commerce',
                  tagImage: '',
                  title: 'Commerce',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'consulting-agency': {
                  path: '/content/cq:tags/caas/events/industry/consulting-agency',
                  tagID: 'caas:events/industry/consulting-agency',
                  name: 'consulting-agency',
                  tagImage: '',
                  title: 'Consulting &amp; Agency',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'consumer-goods': {
                  path: '/content/cq:tags/caas/events/industry/consumer-goods',
                  tagID: 'caas:events/industry/consumer-goods',
                  name: 'consumer-goods',
                  tagImage: '',
                  title: 'Consumer Goods',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'distribution-wholesale': {
                  path: '/content/cq:tags/caas/events/industry/distribution-wholesale',
                  tagID: 'caas:events/industry/distribution-wholesale',
                  name: 'distribution-wholesale',
                  tagImage: '',
                  title: 'Distribution &amp; Wholesale',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                education: {
                  path: '/content/cq:tags/caas/events/industry/education',
                  tagID: 'caas:events/industry/education',
                  name: 'education',
                  tagImage: '',
                  title: 'Education',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'financial-services-insurance': {
                  path: '/content/cq:tags/caas/events/industry/financial-services-insurance',
                  tagID: 'caas:events/industry/financial-services-insurance',
                  name: 'financial-services-insurance',
                  tagImage: '',
                  title: 'Financial Services &amp; Insurance',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                government: {
                  path: '/content/cq:tags/caas/events/industry/government',
                  tagID: 'caas:events/industry/government',
                  name: 'government',
                  tagImage: '',
                  title: 'Government',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'healthcare-lifesciences': {
                  path: '/content/cq:tags/caas/events/industry/healthcare-lifesciences',
                  tagID: 'caas:events/industry/healthcare-lifesciences',
                  name: 'healthcare-lifesciences',
                  tagImage: '',
                  title: 'Healthcare &amp; Life Sciences',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'high-tech': {
                  path: '/content/cq:tags/caas/events/industry/high-tech',
                  tagID: 'caas:events/industry/high-tech',
                  name: 'high-tech',
                  tagImage: '',
                  title: 'High Tech',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                manufacturing: {
                  path: '/content/cq:tags/caas/events/industry/manufacturing',
                  tagID: 'caas:events/industry/manufacturing',
                  name: 'manufacturing',
                  tagImage: '',
                  title: 'Manufacturing',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'media-entertainment': {
                  path: '/content/cq:tags/caas/events/industry/media-entertainment',
                  tagID: 'caas:events/industry/media-entertainment',
                  name: 'media-entertainment',
                  tagImage: '',
                  title: 'Media &amp; Entertainment',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'professional-services': {
                  path: '/content/cq:tags/caas/events/industry/professional-services',
                  tagID: 'caas:events/industry/professional-services',
                  name: 'professional-services',
                  tagImage: '',
                  title: 'Professional Services',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                retail: {
                  path: '/content/cq:tags/caas/events/industry/retail',
                  tagID: 'caas:events/industry/retail',
                  name: 'retail',
                  tagImage: '',
                  title: 'Retail',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'tv-broadcast': {
                  path: '/content/cq:tags/caas/events/industry/tv-broadcast',
                  tagID: 'caas:events/industry/tv-broadcast',
                  name: 'tv-broadcast',
                  tagImage: '',
                  title: 'TV &amp; Broadcast',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                telecommunications: {
                  path: '/content/cq:tags/caas/events/industry/telecommunications',
                  tagID: 'caas:events/industry/telecommunications',
                  name: 'telecommunications',
                  tagImage: '',
                  title: 'Telecommunications',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'travel-hospitality': {
                  path: '/content/cq:tags/caas/events/industry/travel-hospitality',
                  tagID: 'caas:events/industry/travel-hospitality',
                  name: 'travel-hospitality',
                  tagImage: '',
                  title: 'Travel &amp; Hospitality',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'industrial-manufacturing': {
                  path: '/content/cq:tags/caas/events/industry/industrial-manufacturing',
                  tagID: 'caas:events/industry/industrial-manufacturing',
                  name: 'industrial-manufacturing',
                  tagImage: '',
                  title: 'Industrial Manufacturing',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'financial-services': {
                  path: '/content/cq:tags/caas/events/industry/financial-services',
                  tagID: 'caas:events/industry/financial-services',
                  name: 'financial-services',
                  tagImage: '',
                  title: 'Financial Services',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                healthcare: {
                  path: '/content/cq:tags/caas/events/industry/healthcare',
                  tagID: 'caas:events/industry/healthcare',
                  name: 'healthcare',
                  tagImage: '',
                  title: 'Healthcare',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'it-professional-services': {
                  path: '/content/cq:tags/caas/events/industry/it-professional-services',
                  tagID: 'caas:events/industry/it-professional-services',
                  name: 'it-professional-services',
                  tagImage: '',
                  title: 'IT Professional Services',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                lifesciences: {
                  path: '/content/cq:tags/caas/events/industry/lifesciences',
                  tagID: 'caas:events/industry/lifesciences',
                  name: 'lifesciences',
                  tagImage: '',
                  title: 'Lifesciences',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'media-entertainment-communications': {
                  path: '/content/cq:tags/caas/events/industry/media-entertainment-communications',
                  tagID: 'caas:events/industry/media-entertainment-communications',
                  name: 'media-entertainment-communications',
                  tagImage: '',
                  title: 'Media, Entertainment, &amp; Communications',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'travel-hospitality-dining': {
                  path: '/content/cq:tags/caas/events/industry/travel-hospitality-dining',
                  tagID: 'caas:events/industry/travel-hospitality-dining',
                  name: 'travel-hospitality-dining',
                  tagImage: '',
                  title: 'Travel, Hospitality, and Dining',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            type: {
              path: '/content/cq:tags/caas/events/type',
              tagID: 'caas:events/type',
              name: 'type',
              tagImage: '',
              title: 'Type',
              description: '',
              'cq:movedTo': '',
              tags: {
                giveaway: {
                  path: '/content/cq:tags/caas/events/type/giveaway',
                  tagID: 'caas:events/type/giveaway',
                  name: 'giveaway',
                  tagImage: '',
                  title: 'Giveaway',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    discounts: {
                      path: '/content/cq:tags/caas/events/type/giveaway/discounts',
                      tagID: 'caas:events/type/giveaway/discounts',
                      name: 'discounts',
                      tagImage: '',
                      title: 'Discounts',
                      'title.ja': '特別価格（引き換えコード）',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    swags: {
                      path: '/content/cq:tags/caas/events/type/giveaway/swags',
                      tagID: 'caas:events/type/giveaway/swags',
                      name: 'swags',
                      tagImage: '',
                      title: 'Swag',
                      'title.ja': 'グッズ（引換券）',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    sweepstakes: {
                      path: '/content/cq:tags/caas/events/type/giveaway/sweepstakes',
                      tagID: 'caas:events/type/giveaway/sweepstakes',
                      name: 'sweepstakes',
                      tagImage: '',
                      title: 'Sweepstakes',
                      'title.ja': 'プレゼント（応募）',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    documents: {
                      path: '/content/cq:tags/caas/events/type/giveaway/documents',
                      tagID: 'caas:events/type/giveaway/documents',
                      name: 'documents',
                      tagImage: '',
                      title: 'Thought leadership documents',
                      'title.ja': 'ソートリーダーシップのドキュメント／ホワイトペーパー',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    trials: {
                      path: '/content/cq:tags/caas/events/type/giveaway/trials',
                      tagID: 'caas:events/type/giveaway/trials',
                      name: 'trials',
                      tagImage: '',
                      title: 'Free trials',
                      'title.ja': '無料体験',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    demos: {
                      path: '/content/cq:tags/caas/events/type/giveaway/demos',
                      tagID: 'caas:events/type/giveaway/demos',
                      name: 'demos',
                      tagImage: '',
                      title: 'Free consultations',
                      'title.ja': '無料デモ／コンサルティング',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'everyone-wins': {
                      path: '/content/cq:tags/caas/events/type/giveaway/everyone-wins',
                      tagID: 'caas:events/type/giveaway/everyone-wins',
                      name: 'everyone-wins',
                      tagImage: '',
                      title: 'Everyone Wins',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'enter-to-win-electronics': {
                      path: '/content/cq:tags/caas/events/type/giveaway/enter-to-win-electronics',
                      tagID: 'caas:events/type/giveaway/enter-to-win-electronics',
                      name: 'enter-to-win-electronics',
                      tagImage: '',
                      title: 'Enter to Win - Electronics',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'enter-to-win-software': {
                      path: '/content/cq:tags/caas/events/type/giveaway/enter-to-win-software',
                      tagID: 'caas:events/type/giveaway/enter-to-win-software',
                      name: 'enter-to-win-software',
                      tagImage: '',
                      title: 'Enter to Win - Software',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'enter-to-win-swag': {
                      path: '/content/cq:tags/caas/events/type/giveaway/enter-to-win-swag',
                      tagID: 'caas:events/type/giveaway/enter-to-win-swag',
                      name: 'enter-to-win-swag',
                      tagImage: '',
                      title: 'Enter to Win - Prizes',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'enter-to-win-tech-gadgets': {
                      path: '/content/cq:tags/caas/events/type/giveaway/enter-to-win-tech-gadgets',
                      tagID: 'caas:events/type/giveaway/enter-to-win-tech-gadgets',
                      name: 'enter-to-win-tech-gadgets',
                      tagImage: '',
                      title: 'Enter to Win - Tech Gadgets ',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'enter-to-win-gift-cards': {
                      path: '/content/cq:tags/caas/events/type/giveaway/enter-to-win-gift-cards',
                      tagID: 'caas:events/type/giveaway/enter-to-win-gift-cards',
                      name: 'enter-to-win-gift-cards',
                      tagImage: '',
                      title: 'Enter to Win - Gift Cards',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'enter-to-win-office-electronics': {
                      path: '/content/cq:tags/caas/events/type/giveaway/enter-to-win-office-electronics',
                      tagID: 'caas:events/type/giveaway/enter-to-win-office-electronics',
                      name: 'enter-to-win-office-electronics',
                      tagImage: '',
                      title: 'Enter to Win - Office Electronics',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                newsroom: {
                  path: '/content/cq:tags/caas/events/type/newsroom',
                  tagID: 'caas:events/type/newsroom',
                  name: 'newsroom',
                  tagImage: '',
                  title: 'Newsroom',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                sponsor: {
                  path: '/content/cq:tags/caas/events/type/sponsor',
                  tagID: 'caas:events/type/sponsor',
                  name: 'sponsor',
                  tagImage: '',
                  title: 'Sponsor',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'customer-spotlight': {
                  path: '/content/cq:tags/caas/events/type/customer-spotlight',
                  tagID: 'caas:events/type/customer-spotlight',
                  name: 'customer-spotlight',
                  tagImage: '',
                  title: 'Customer Spotlight',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'customer-showcase': {
                  path: '/content/cq:tags/caas/events/type/customer-showcase',
                  tagID: 'caas:events/type/customer-showcase',
                  name: 'customer-showcase',
                  tagImage: '',
                  title: 'Customer Showcase',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                breaks: {
                  path: '/content/cq:tags/caas/events/type/breaks',
                  tagID: 'caas:events/type/breaks',
                  name: 'breaks',
                  tagImage: '',
                  title: 'Breaks',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'co-create': {
                  path: '/content/cq:tags/caas/events/type/co-create',
                  tagID: 'caas:events/type/co-create',
                  name: 'co-create',
                  tagImage: '',
                  title: 'Co-Create',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                community: {
                  path: '/content/cq:tags/caas/events/type/community',
                  tagID: 'caas:events/type/community',
                  name: 'community',
                  tagImage: '',
                  title: 'Community',
                  'title.ja': 'コミュニティ',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'art-walks': {
                  path: '/content/cq:tags/caas/events/type/art-walks',
                  tagID: 'caas:events/type/art-walks',
                  name: 'art-walks',
                  tagImage: '',
                  title: 'Art Walks',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'take-five': {
                  path: '/content/cq:tags/caas/events/type/take-five',
                  tagID: 'caas:events/type/take-five',
                  name: 'take-five',
                  tagImage: '',
                  title: 'Take Five',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'downloadable-resources': {
                  path: '/content/cq:tags/caas/events/type/downloadable-resources',
                  tagID: 'caas:events/type/downloadable-resources',
                  name: 'downloadable-resources',
                  tagImage: '',
                  title: 'Downloadable Resources',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'thought-leadership-documents': {
                      path: '/content/cq:tags/caas/events/type/downloadable-resources/thought-leadership-documents',
                      tagID: 'caas:events/type/downloadable-resources/thought-leadership-documents',
                      name: 'thought-leadership-documents',
                      tagImage: '',
                      title: 'Thought Leadership Documents',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'inspiring-case-studies': {
                      path: '/content/cq:tags/caas/events/type/downloadable-resources/inspiring-case-studies',
                      tagID: 'caas:events/type/downloadable-resources/inspiring-case-studies',
                      name: 'inspiring-case-studies',
                      tagImage: '',
                      title: 'Inspiring Case Studies',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'tips-tricks-tools': {
                      path: '/content/cq:tags/caas/events/type/downloadable-resources/tips-tricks-tools',
                      tagID: 'caas:events/type/downloadable-resources/tips-tricks-tools',
                      name: 'tips-tricks-tools',
                      tagImage: '',
                      title: 'Tips, Tricks, and Tools',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'how-to-guides': {
                      path: '/content/cq:tags/caas/events/type/downloadable-resources/how-to-guides',
                      tagID: 'caas:events/type/downloadable-resources/how-to-guides',
                      name: 'how-to-guides',
                      tagImage: '',
                      title: 'How-To Guides',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'creative-resources': {
                      path: '/content/cq:tags/caas/events/type/downloadable-resources/creative-resources',
                      tagID: 'caas:events/type/downloadable-resources/creative-resources',
                      name: 'creative-resources',
                      tagImage: '',
                      title: 'Creative Resources',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'original-art-imagery': {
                      path: '/content/cq:tags/caas/events/type/downloadable-resources/original-art-imagery',
                      tagID: 'caas:events/type/downloadable-resources/original-art-imagery',
                      name: 'original-art-imagery',
                      tagImage: '',
                      title: 'Original Art and Imagery',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'social-media-assets': {
                      path: '/content/cq:tags/caas/events/type/downloadable-resources/social-media-assets',
                      tagID: 'caas:events/type/downloadable-resources/social-media-assets',
                      name: 'social-media-assets',
                      tagImage: '',
                      title: 'Social Media Assets',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                track: {
                  path: '/content/cq:tags/caas/events/type/track',
                  tagID: 'caas:events/type/track',
                  name: 'track',
                  tagImage: '',
                  title: 'Track',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'creativity-design-business': {
                      path: '/content/cq:tags/caas/events/type/track/creativity-design-business',
                      tagID: 'caas:events/type/track/creativity-design-business',
                      name: 'creativity-design-business',
                      tagImage: '',
                      title: 'Creativity and Design in Business',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'drawing-painting-illustration': {
                      path: '/content/cq:tags/caas/events/type/track/drawing-painting-illustration',
                      tagID: 'caas:events/type/track/drawing-painting-illustration',
                      name: 'drawing-painting-illustration',
                      tagImage: '',
                      title: 'Drawing, Painting, and Illustration',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    '3d-ar': {
                      path: '/content/cq:tags/caas/events/type/track/3d-ar',
                      tagID: 'caas:events/type/track/3d-ar',
                      name: '3d-ar',
                      tagImage: '',
                      title: '3D and AR',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'collaboration-productivity': {
                      path: '/content/cq:tags/caas/events/type/track/collaboration-productivity',
                      tagID: 'caas:events/type/track/collaboration-productivity',
                      name: 'collaboration-productivity',
                      tagImage: '',
                      title: 'Collaboration and Productivity',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'ui-ux': {
                      path: '/content/cq:tags/caas/events/type/track/ui-ux',
                      tagID: 'caas:events/type/track/ui-ux',
                      name: 'ui-ux',
                      tagImage: '',
                      title: 'UI and UX',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    education: {
                      path: '/content/cq:tags/caas/events/type/track/education',
                      tagID: 'caas:events/type/track/education',
                      name: 'education',
                      tagImage: '',
                      title: 'Education',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'graphic-design': {
                      path: '/content/cq:tags/caas/events/type/track/graphic-design',
                      tagID: 'caas:events/type/track/graphic-design',
                      name: 'graphic-design',
                      tagImage: '',
                      title: 'Graphic Design',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'social-media-marketing': {
                      path: '/content/cq:tags/caas/events/type/track/social-media-marketing',
                      tagID: 'caas:events/type/track/social-media-marketing',
                      name: 'social-media-marketing',
                      tagImage: '',
                      title: 'Social Media and Marketing',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    photography: {
                      path: '/content/cq:tags/caas/events/type/track/photography',
                      tagID: 'caas:events/type/track/photography',
                      name: 'photography',
                      tagImage: '',
                      title: 'Photography',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'video-audio-motion': {
                      path: '/content/cq:tags/caas/events/type/track/video-audio-motion',
                      tagID: 'caas:events/type/track/video-audio-motion',
                      name: 'video-audio-motion',
                      tagImage: '',
                      title: 'Video, Audio, and Motion',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
              },
            },
            'presentation-style': {
              path: '/content/cq:tags/caas/events/presentation-style',
              tagID: 'caas:events/presentation-style',
              name: 'presentation-style',
              tagImage: '',
              title: 'Presentation Style',
              description: '',
              'cq:movedTo': '',
              tags: {
                'case-use-study': {
                  path: '/content/cq:tags/caas/events/presentation-style/case-use-study',
                  tagID: 'caas:events/presentation-style/case-use-study',
                  name: 'case-use-study',
                  tagImage: '',
                  title: 'Case &amp; Use Study',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'thought-leadership': {
                  path: '/content/cq:tags/caas/events/presentation-style/thought-leadership',
                  tagID: 'caas:events/presentation-style/thought-leadership',
                  name: 'thought-leadership',
                  tagImage: '',
                  title: 'Thought Leadership',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'tips-tricks': {
                  path: '/content/cq:tags/caas/events/presentation-style/tips-tricks',
                  tagID: 'caas:events/presentation-style/tips-tricks',
                  name: 'tips-tricks',
                  tagImage: '',
                  title: 'Tips &amp; Tricks',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'tips-and-tricks': {
                  path: '/content/cq:tags/caas/events/presentation-style/tips-and-tricks',
                  tagID: 'caas:events/presentation-style/tips-and-tricks',
                  name: 'tips-and-tricks',
                  tagImage: '',
                  title: 'Tips and Tricks (How To)',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'case-study': {
                  path: '/content/cq:tags/caas/events/presentation-style/case-study',
                  tagID: 'caas:events/presentation-style/case-study',
                  name: 'case-study',
                  tagImage: '',
                  title: 'Case Study',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'value-realization': {
                  path: '/content/cq:tags/caas/events/presentation-style/value-realization',
                  tagID: 'caas:events/presentation-style/value-realization',
                  name: 'value-realization',
                  tagImage: '',
                  title: 'Value Realization',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            eml: {
              path: '/content/cq:tags/caas/events/eml',
              tagID: 'caas:events/eml',
              name: 'eml',
              tagImage: '',
              title: 'EML',
              description: '',
              'cq:movedTo': '',
              tags: {
                track: {
                  path: '/content/cq:tags/caas/events/eml/track',
                  tagID: 'caas:events/eml/track',
                  name: 'track',
                  tagImage: '',
                  title: 'Track',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'experience-maker-success': {
                      path: '/content/cq:tags/caas/events/eml/track/experience-maker-success',
                      tagID: 'caas:events/eml/track/experience-maker-success',
                      name: 'experience-maker-success',
                      tagImage: '',
                      title: 'Experience Maker success',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    healthcare: {
                      path: '/content/cq:tags/caas/events/eml/track/healthcare',
                      tagID: 'caas:events/eml/track/healthcare',
                      name: 'healthcare',
                      tagImage: '',
                      title: 'Healthcare',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'financial-services': {
                      path: '/content/cq:tags/caas/events/eml/track/financial-services',
                      tagID: 'caas:events/eml/track/financial-services',
                      name: 'financial-services',
                      tagImage: '',
                      title: 'Financial Services',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'high-tech': {
                      path: '/content/cq:tags/caas/events/eml/track/high-tech',
                      tagID: 'caas:events/eml/track/high-tech',
                      name: 'high-tech',
                      tagImage: '',
                      title: 'High Tech',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    retail: {
                      path: '/content/cq:tags/caas/events/eml/track/retail',
                      tagID: 'caas:events/eml/track/retail',
                      name: 'retail',
                      tagImage: '',
                      title: 'Retail',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'real-time-profiles-for-real-personalization': {
                      path: '/content/cq:tags/caas/events/eml/track/real-time-profiles-for-real-personalization',
                      tagID: 'caas:events/eml/track/real-time-profiles-for-real-personalization',
                      name: 'real-time-profiles-for-real-personalization',
                      tagImage: '',
                      title: 'Real-Time Profiles for Real Personalization',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'intelligent-content-at-scale': {
                      path: '/content/cq:tags/caas/events/eml/track/intelligent-content-at-scale',
                      tagID: 'caas:events/eml/track/intelligent-content-at-scale',
                      name: 'intelligent-content-at-scale',
                      tagImage: '',
                      title: 'Intelligent Content at Scale',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'managing-collaborative-work': {
                      path: '/content/cq:tags/caas/events/eml/track/managing-collaborative-work',
                      tagID: 'caas:events/eml/track/managing-collaborative-work',
                      name: 'managing-collaborative-work',
                      tagImage: '',
                      title: 'Managing Collaborative Work',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'driving-growth-with-commerce': {
                      path: '/content/cq:tags/caas/events/eml/track/driving-growth-with-commerce',
                      tagID: 'caas:events/eml/track/driving-growth-with-commerce',
                      name: 'driving-growth-with-commerce',
                      tagImage: '',
                      title: 'Driving Growth with Commerce',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'pursuit-of-data-excellence': {
                      path: '/content/cq:tags/caas/events/eml/track/pursuit-of-data-excellence',
                      tagID: 'caas:events/eml/track/pursuit-of-data-excellence',
                      name: 'pursuit-of-data-excellence',
                      tagImage: '',
                      title: 'The Pursuit of Data Excellence',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'b2b-customer-journeys-in-real-time': {
                      path: '/content/cq:tags/caas/events/eml/track/b2b-customer-journeys-in-real-time',
                      tagID: 'caas:events/eml/track/b2b-customer-journeys-in-real-time',
                      name: 'b2b-customer-journeys-in-real-time',
                      tagImage: '',
                      title: 'B2B Customer Journeys in Real Time',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'b2c-customer-journeys-in-real-time': {
                      path: '/content/cq:tags/caas/events/eml/track/b2c-customer-journeys-in-real-time',
                      tagID: 'caas:events/eml/track/b2c-customer-journeys-in-real-time',
                      name: 'b2c-customer-journeys-in-real-time',
                      tagImage: '',
                      title: 'B2C Customer Journeys in Real Time',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'trends-and-inspiration': {
                      path: '/content/cq:tags/caas/events/eml/track/trends-and-inspiration',
                      tagID: 'caas:events/eml/track/trends-and-inspiration',
                      name: 'trends-and-inspiration',
                      tagImage: '',
                      title: 'Trends and Inspiration',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                'primary-track': {
                  path: '/content/cq:tags/caas/events/eml/primary-track',
                  tagID: 'caas:events/eml/primary-track',
                  name: 'primary-track',
                  tagImage: '',
                  title: 'Primary Track',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'experience-maker-success': {
                      path: '/content/cq:tags/caas/events/eml/primary-track/experience-maker-success',
                      tagID: 'caas:events/eml/primary-track/experience-maker-success',
                      name: 'experience-maker-success',
                      tagImage: '',
                      title: 'Experience Maker success',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    healthcare: {
                      path: '/content/cq:tags/caas/events/eml/primary-track/healthcare',
                      tagID: 'caas:events/eml/primary-track/healthcare',
                      name: 'healthcare',
                      tagImage: '',
                      title: 'Healthcare',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'financial-services': {
                      path: '/content/cq:tags/caas/events/eml/primary-track/financial-services',
                      tagID: 'caas:events/eml/primary-track/financial-services',
                      name: 'financial-services',
                      tagImage: '',
                      title: 'Financial Services',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'high-tech': {
                      path: '/content/cq:tags/caas/events/eml/primary-track/high-tech',
                      tagID: 'caas:events/eml/primary-track/high-tech',
                      name: 'high-tech',
                      tagImage: '',
                      title: 'High Tech',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    retail: {
                      path: '/content/cq:tags/caas/events/eml/primary-track/retail',
                      tagID: 'caas:events/eml/primary-track/retail',
                      name: 'retail',
                      tagImage: '',
                      title: 'Retail',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'real-time-profiles-for-real-personalization': {
                      path: '/content/cq:tags/caas/events/eml/primary-track/real-time-profiles-for-real-personalization',
                      tagID: 'caas:events/eml/primary-track/real-time-profiles-for-real-personalization',
                      name: 'real-time-profiles-for-real-personalization',
                      tagImage: '',
                      title: 'Real-Time Profiles for Real Personalization',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'intelligent-content-at-scale': {
                      path: '/content/cq:tags/caas/events/eml/primary-track/intelligent-content-at-scale',
                      tagID: 'caas:events/eml/primary-track/intelligent-content-at-scale',
                      name: 'intelligent-content-at-scale',
                      tagImage: '',
                      title: 'Intelligent Content​ at Scale',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'managing-collaborative-work': {
                      path: '/content/cq:tags/caas/events/eml/primary-track/managing-collaborative-work',
                      tagID: 'caas:events/eml/primary-track/managing-collaborative-work',
                      name: 'managing-collaborative-work',
                      tagImage: '',
                      title: 'Managing Collaborative Work',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'driving-growth-with-commerce': {
                      path: '/content/cq:tags/caas/events/eml/primary-track/driving-growth-with-commerce',
                      tagID: 'caas:events/eml/primary-track/driving-growth-with-commerce',
                      name: 'driving-growth-with-commerce',
                      tagImage: '',
                      title: 'Driving Growth​ with Commerce​',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'pursuit-of-data-excellence': {
                      path: '/content/cq:tags/caas/events/eml/primary-track/pursuit-of-data-excellence',
                      tagID: 'caas:events/eml/primary-track/pursuit-of-data-excellence',
                      name: 'pursuit-of-data-excellence',
                      tagImage: '',
                      title: 'The Pursuit of Data Excellence',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'b2b-customer-journeys-in-real-time': {
                      path: '/content/cq:tags/caas/events/eml/primary-track/b2b-customer-journeys-in-real-time',
                      tagID: 'caas:events/eml/primary-track/b2b-customer-journeys-in-real-time',
                      name: 'b2b-customer-journeys-in-real-time',
                      tagImage: '',
                      title: 'B2B Customer Journeys​ in Real Time',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'b2c-customer-journeys-in-real-time': {
                      path: '/content/cq:tags/caas/events/eml/primary-track/b2c-customer-journeys-in-real-time',
                      tagID: 'caas:events/eml/primary-track/b2c-customer-journeys-in-real-time',
                      name: 'b2c-customer-journeys-in-real-time',
                      tagImage: '',
                      title: 'B2C Customer​ Journeys​ in Real Time',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'trends-and-inspiration': {
                      path: '/content/cq:tags/caas/events/eml/primary-track/trends-and-inspiration',
                      tagID: 'caas:events/eml/primary-track/trends-and-inspiration',
                      name: 'trends-and-inspiration',
                      tagImage: '',
                      title: 'Trends​ and Inspiration',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    keynote: {
                      path: '/content/cq:tags/caas/events/eml/primary-track/keynote',
                      tagID: 'caas:events/eml/primary-track/keynote',
                      name: 'keynote',
                      tagImage: '',
                      title: 'Keynote',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'ask-the-experts': {
                      path: '/content/cq:tags/caas/events/eml/primary-track/ask-the-experts',
                      tagID: 'caas:events/eml/primary-track/ask-the-experts',
                      name: 'ask-the-experts',
                      tagImage: '',
                      title: 'Ask the experts',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
              },
            },
            emgf: {
              path: '/content/cq:tags/caas/events/emgf',
              tagID: 'caas:events/emgf',
              name: 'emgf',
              tagImage: '',
              title: 'EMGF',
              description: '',
              'cq:movedTo': '',
              tags: {
                track: {
                  path: '/content/cq:tags/caas/events/emgf/track',
                  tagID: 'caas:events/emgf/track',
                  name: 'track',
                  tagImage: '',
                  title: 'Track',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'department-of-defense': {
                      path: '/content/cq:tags/caas/events/emgf/track/department-of-defense',
                      tagID: 'caas:events/emgf/track/department-of-defense',
                      name: 'department-of-defense',
                      tagImage: '',
                      title: 'Department of Defense',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    federal: {
                      path: '/content/cq:tags/caas/events/emgf/track/federal',
                      tagID: 'caas:events/emgf/track/federal',
                      name: 'federal',
                      tagImage: '',
                      title: 'Federal',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'state-local': {
                      path: '/content/cq:tags/caas/events/emgf/track/state-local',
                      tagID: 'caas:events/emgf/track/state-local',
                      name: 'state-local',
                      tagImage: '',
                      title: 'State and Local',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'national-security': {
                      path: '/content/cq:tags/caas/events/emgf/track/national-security',
                      tagID: 'caas:events/emgf/track/national-security',
                      name: 'national-security',
                      tagImage: '',
                      title: 'National Security',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
              },
            },
            diversity: {
              path: '/content/cq:tags/caas/events/diversity',
              tagID: 'caas:events/diversity',
              name: 'diversity',
              tagImage: '',
              title: 'Diversity',
              description: '',
              'cq:movedTo': '',
              tags: {
                'woman-owned': {
                  path: '/content/cq:tags/caas/events/diversity/woman-owned',
                  tagID: 'caas:events/diversity/woman-owned',
                  name: 'woman-owned',
                  tagImage: '',
                  title: 'Woman owned',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'lgbtqia-owned': {
                  path: '/content/cq:tags/caas/events/diversity/lgbtqia-owned',
                  tagID: 'caas:events/diversity/lgbtqia-owned',
                  name: 'lgbtqia-owned',
                  tagImage: '',
                  title: 'LGBTQIA+ owned',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'lgbtqia-woman-owned': {
                  path: '/content/cq:tags/caas/events/diversity/lgbtqia-woman-owned',
                  tagID: 'caas:events/diversity/lgbtqia-woman-owned',
                  name: 'lgbtqia-woman-owned',
                  tagImage: '',
                  title: 'LGBTQIA+, Woman owned',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'aapi-owned': {
                  path: '/content/cq:tags/caas/events/diversity/aapi-owned',
                  tagID: 'caas:events/diversity/aapi-owned',
                  name: 'aapi-owned',
                  tagImage: '',
                  title: 'AAPI owned',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'aapi-woman-owned': {
                  path: '/content/cq:tags/caas/events/diversity/aapi-woman-owned',
                  tagID: 'caas:events/diversity/aapi-woman-owned',
                  name: 'aapi-woman-owned',
                  tagImage: '',
                  title: 'AAPI, Woman owned',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'black-woman-owned': {
                  path: '/content/cq:tags/caas/events/diversity/black-woman-owned',
                  tagID: 'caas:events/diversity/black-woman-owned',
                  name: 'black-woman-owned',
                  tagImage: '',
                  title: 'Black, Woman owned',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'black-lgbtqia-woman-owned': {
                  path: '/content/cq:tags/caas/events/diversity/black-lgbtqia-woman-owned',
                  tagID: 'caas:events/diversity/black-lgbtqia-woman-owned',
                  name: 'black-lgbtqia-woman-owned',
                  tagImage: '',
                  title: 'Black, LGBTQIA+, Woman owned',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'aapi-lgbtqia-owned': {
                  path: '/content/cq:tags/caas/events/diversity/aapi-lgbtqia-owned',
                  tagID: 'caas:events/diversity/aapi-lgbtqia-owned',
                  name: 'aapi-lgbtqia-owned',
                  tagImage: '',
                  title: 'AAPI, LGBTQIA+ owned',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'latinx-owned': {
                  path: '/content/cq:tags/caas/events/diversity/latinx-owned',
                  tagID: 'caas:events/diversity/latinx-owned',
                  name: 'latinx-owned',
                  tagImage: '',
                  title: 'Latinx owned',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'black-owned': {
                  path: '/content/cq:tags/caas/events/diversity/black-owned',
                  tagID: 'caas:events/diversity/black-owned',
                  name: 'black-owned',
                  tagImage: '',
                  title: 'Black owned',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'aapi-lgbtqia-woman-owned': {
                  path: '/content/cq:tags/caas/events/diversity/aapi-lgbtqia-woman-owned',
                  tagID: 'caas:events/diversity/aapi-lgbtqia-woman-owned',
                  name: 'aapi-lgbtqia-woman-owned',
                  tagImage: '',
                  title: 'AAPI, LGBTQIA+, Woman owned',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            sessions: {
              path: '/content/cq:tags/caas/events/sessions',
              tagID: 'caas:events/sessions',
              name: 'sessions',
              tagImage: '',
              title: 'Sessions',
              description: '',
              'cq:movedTo': '',
              tags: {
                region: {
                  path: '/content/cq:tags/caas/events/sessions/region',
                  tagID: 'caas:events/sessions/region',
                  name: 'region',
                  tagImage: '',
                  title: 'Region',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'americas-day-1': {
                      path: '/content/cq:tags/caas/events/sessions/region/americas-day-1',
                      tagID: 'caas:events/sessions/region/americas-day-1',
                      name: 'americas-day-1',
                      tagImage: '',
                      title: 'Americas Day 1',
                      'title.ja': '南北アメリカ 1日目',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'americas-day-2': {
                      path: '/content/cq:tags/caas/events/sessions/region/americas-day-2',
                      tagID: 'caas:events/sessions/region/americas-day-2',
                      name: 'americas-day-2',
                      tagImage: '',
                      title: 'Americas Day 2',
                      'title.ja': '南北アメリカ 2日目',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'australia-new-zealand-day-1': {
                      path: '/content/cq:tags/caas/events/sessions/region/australia-new-zealand-day-1',
                      tagID: 'caas:events/sessions/region/australia-new-zealand-day-1',
                      name: 'australia-new-zealand-day-1',
                      tagImage: '',
                      title: 'Australia &amp; New Zealand Day 1',
                      'title.ja': 'オーストラリア、ニュージーランド 1日目',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'asia-india-day-1': {
                      path: '/content/cq:tags/caas/events/sessions/region/asia-india-day-1',
                      tagID: 'caas:events/sessions/region/asia-india-day-1',
                      name: 'asia-india-day-1',
                      tagImage: '',
                      title: 'Asia &amp; India Day 1',
                      'title.ja': '東南アジア、インド 1日目',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'europe-middle-east-africa-day-1': {
                      path: '/content/cq:tags/caas/events/sessions/region/europe-middle-east-africa-day-1',
                      tagID: 'caas:events/sessions/region/europe-middle-east-africa-day-1',
                      name: 'europe-middle-east-africa-day-1',
                      tagImage: '',
                      title: 'Europe, Middle East, and Africa Day 1',
                      'title.ja': 'ヨーロッパ、中東、アフリカ 1日目',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'europe-middle-east-africa-day-2': {
                      path: '/content/cq:tags/caas/events/sessions/region/europe-middle-east-africa-day-2',
                      tagID: 'caas:events/sessions/region/europe-middle-east-africa-day-2',
                      name: 'europe-middle-east-africa-day-2',
                      tagImage: '',
                      title: 'Europe, Middle East, and Africa Day 2',
                      'title.ja': 'ヨーロッパ、中東、アフリカ 2日目',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'asia-pacific': {
                      path: '/content/cq:tags/caas/events/sessions/region/asia-pacific',
                      tagID: 'caas:events/sessions/region/asia-pacific',
                      name: 'asia-pacific',
                      tagImage: '',
                      title: 'Asia Pacific',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    japan: {
                      path: '/content/cq:tags/caas/events/sessions/region/japan',
                      tagID: 'caas:events/sessions/region/japan',
                      name: 'japan',
                      tagImage: '',
                      title: 'Japan',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
              },
            },
            'session-format': {
              path: '/content/cq:tags/caas/events/session-format',
              tagID: 'caas:events/session-format',
              name: 'session-format',
              tagImage: '',
              title: 'Session Format',
              description: '',
              'cq:movedTo': '',
              tags: {
                virtual: {
                  path: '/content/cq:tags/caas/events/session-format/virtual',
                  tagID: 'caas:events/session-format/virtual',
                  name: 'virtual',
                  tagImage: '',
                  title: 'Online',
                  'title.ja': 'オンライン',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'in-person': {
                  path: '/content/cq:tags/caas/events/session-format/in-person',
                  tagID: 'caas:events/session-format/in-person',
                  name: 'in-person',
                  tagImage: '',
                  title: 'In-Person',
                  'title.ja': '対面',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'on-demand': {
                      path: '/content/cq:tags/caas/events/session-format/in-person/on-demand',
                      tagID: 'caas:events/session-format/in-person/on-demand',
                      name: 'on-demand',
                      tagImage: '',
                      title: 'In-Person On Demand',
                      'title.ja': '対面（オンデマンド）',
                      description: '',
                      'cq:movedTo': '',
                      tags: {
                        yes: {
                          path: '/content/cq:tags/caas/events/session-format/in-person/on-demand/yes',
                          tagID: 'caas:events/session-format/in-person/on-demand/yes',
                          name: 'yes',
                          tagImage: '',
                          title: 'Yes',
                          'title.ja': 'はい',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        no: {
                          path: '/content/cq:tags/caas/events/session-format/in-person/on-demand/no',
                          tagID: 'caas:events/session-format/in-person/on-demand/no',
                          name: 'no',
                          tagImage: '',
                          title: 'No',
                          'title.ja': 'いいえ',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                      },
                    },
                    'on-demand-post-event': {
                      path: '/content/cq:tags/caas/events/session-format/in-person/on-demand-post-event',
                      tagID: 'caas:events/session-format/in-person/on-demand-post-event',
                      name: 'on-demand-post-event',
                      tagImage: '',
                      title: 'On demand post event',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                online: {
                  path: '/content/cq:tags/caas/events/session-format/online',
                  tagID: 'caas:events/session-format/online',
                  name: 'online',
                  tagImage: '',
                  title: 'Online',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            'speaker-event': {
              path: '/content/cq:tags/caas/events/speaker-event',
              tagID: 'caas:events/speaker-event',
              name: 'speaker-event',
              tagImage: '',
              title: 'Speaker Event',
              'title.ja': 'スピーカーイベント',
              description: '',
              'cq:movedTo': '',
              tags: {
                virtual: {
                  path: '/content/cq:tags/caas/events/speaker-event/virtual',
                  tagID: 'caas:events/speaker-event/virtual',
                  name: 'virtual',
                  tagImage: '',
                  title: 'Online',
                  'title.ja': 'オンライン',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'in-person': {
                  path: '/content/cq:tags/caas/events/speaker-event/in-person',
                  tagID: 'caas:events/speaker-event/in-person',
                  name: 'in-person',
                  tagImage: '',
                  title: 'In-Person',
                  'title.ja': '対面',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                online: {
                  path: '/content/cq:tags/caas/events/speaker-event/online',
                  tagID: 'caas:events/speaker-event/online',
                  name: 'online',
                  tagImage: '',
                  title: 'Online',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            bootcamp: {
              path: '/content/cq:tags/caas/events/bootcamp',
              tagID: 'caas:events/bootcamp',
              name: 'bootcamp',
              tagImage: '',
              title: 'Bootcamp',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            seasons: {
              path: '/content/cq:tags/caas/events/seasons',
              tagID: 'caas:events/seasons',
              name: 'seasons',
              tagImage: '',
              title: 'Seasons',
              description: '',
              'cq:movedTo': '',
              tags: {
                winter: {
                  path: '/content/cq:tags/caas/events/seasons/winter',
                  tagID: 'caas:events/seasons/winter',
                  name: 'winter',
                  tagImage: '',
                  title: 'Winter',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                autumn: {
                  path: '/content/cq:tags/caas/events/seasons/autumn',
                  tagID: 'caas:events/seasons/autumn',
                  name: 'autumn',
                  tagImage: '',
                  title: 'Autumn',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                summer: {
                  path: '/content/cq:tags/caas/events/seasons/summer',
                  tagID: 'caas:events/seasons/summer',
                  name: 'summer',
                  tagImage: '',
                  title: 'Summer',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                spring: {
                  path: '/content/cq:tags/caas/events/seasons/spring',
                  tagID: 'caas:events/seasons/spring',
                  name: 'spring',
                  tagImage: '',
                  title: 'Spring',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            'max-london': {
              path: '/content/cq:tags/caas/events/max-london',
              tagID: 'caas:events/max-london',
              name: 'max-london',
              tagImage: '',
              title: 'MAX London',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        gated: {
          path: '/content/cq:tags/caas/gated',
          tagID: 'caas:gated',
          name: 'gated',
          tagImage: '',
          title: 'Gated',
          description: '',
          'cq:movedTo': '',
          tags: {},
        },
        country: {
          path: '/content/cq:tags/caas/country',
          tagID: 'caas:country',
          name: 'country',
          tagImage: '',
          title: 'Country',
          description: '',
          'cq:movedTo': '',
          tags: {
            us: {
              path: '/content/cq:tags/caas/country/us',
              tagID: 'caas:country/us',
              name: 'us',
              tagImage: '',
              title: 'United States',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            at: {
              path: '/content/cq:tags/caas/country/at',
              tagID: 'caas:country/at',
              name: 'at',
              tagImage: '',
              title: 'Austria',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            be: {
              path: '/content/cq:tags/caas/country/be',
              tagID: 'caas:country/be',
              name: 'be',
              tagImage: '',
              title: 'Belgium',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            bg: {
              path: '/content/cq:tags/caas/country/bg',
              tagID: 'caas:country/bg',
              name: 'bg',
              tagImage: '',
              title: 'Bulgaria',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            br: {
              path: '/content/cq:tags/caas/country/br',
              tagID: 'caas:country/br',
              name: 'br',
              tagImage: '',
              title: 'Brazil',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ca: {
              path: '/content/cq:tags/caas/country/ca',
              tagID: 'caas:country/ca',
              name: 'ca',
              tagImage: '',
              title: 'Canada',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ch: {
              path: '/content/cq:tags/caas/country/ch',
              tagID: 'caas:country/ch',
              name: 'ch',
              tagImage: '',
              title: 'Switzerland',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            cis: {
              path: '/content/cq:tags/caas/country/cis',
              tagID: 'caas:country/cis',
              name: 'cis',
              tagImage: '',
              title: 'CIS',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            cn: {
              path: '/content/cq:tags/caas/country/cn',
              tagID: 'caas:country/cn',
              name: 'cn',
              tagImage: '',
              title: 'China',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            cz: {
              path: '/content/cq:tags/caas/country/cz',
              tagID: 'caas:country/cz',
              name: 'cz',
              tagImage: '',
              title: 'Czech Replublic',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            de: {
              path: '/content/cq:tags/caas/country/de',
              tagID: 'caas:country/de',
              name: 'de',
              tagImage: '',
              title: 'Germany',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            dk: {
              path: '/content/cq:tags/caas/country/dk',
              tagID: 'caas:country/dk',
              name: 'dk',
              tagImage: '',
              title: 'Denmark',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ee: {
              path: '/content/cq:tags/caas/country/ee',
              tagID: 'caas:country/ee',
              name: 'ee',
              tagImage: '',
              title: 'Estonia',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            es: {
              path: '/content/cq:tags/caas/country/es',
              tagID: 'caas:country/es',
              name: 'es',
              tagImage: '',
              title: 'Spain',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            fi: {
              path: '/content/cq:tags/caas/country/fi',
              tagID: 'caas:country/fi',
              name: 'fi',
              tagImage: '',
              title: 'Finland',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            fr: {
              path: '/content/cq:tags/caas/country/fr',
              tagID: 'caas:country/fr',
              name: 'fr',
              tagImage: '',
              title: 'France',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            hk: {
              path: '/content/cq:tags/caas/country/hk',
              tagID: 'caas:country/hk',
              name: 'hk',
              tagImage: '',
              title: 'Hong Kong',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            hr: {
              path: '/content/cq:tags/caas/country/hr',
              tagID: 'caas:country/hr',
              name: 'hr',
              tagImage: '',
              title: 'Croatia',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            hu: {
              path: '/content/cq:tags/caas/country/hu',
              tagID: 'caas:country/hu',
              name: 'hu',
              tagImage: '',
              title: 'Hungary',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            il: {
              path: '/content/cq:tags/caas/country/il',
              tagID: 'caas:country/il',
              name: 'il',
              tagImage: '',
              title: 'Israel',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            it: {
              path: '/content/cq:tags/caas/country/it',
              tagID: 'caas:country/it',
              name: 'it',
              tagImage: '',
              title: 'Italy',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            jp: {
              path: '/content/cq:tags/caas/country/jp',
              tagID: 'caas:country/jp',
              name: 'jp',
              tagImage: '',
              title: 'Japan',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            kr: {
              path: '/content/cq:tags/caas/country/kr',
              tagID: 'caas:country/kr',
              name: 'kr',
              tagImage: '',
              title: 'Korea',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            la: {
              path: '/content/cq:tags/caas/country/la',
              tagID: 'caas:country/la',
              name: 'la',
              tagImage: '',
              title: 'Latin America',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            lt: {
              path: '/content/cq:tags/caas/country/lt',
              tagID: 'caas:country/lt',
              name: 'lt',
              tagImage: '',
              title: 'Lithuania',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            lu: {
              path: '/content/cq:tags/caas/country/lu',
              tagID: 'caas:country/lu',
              name: 'lu',
              tagImage: '',
              title: 'Luxembourg',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            lv: {
              path: '/content/cq:tags/caas/country/lv',
              tagID: 'caas:country/lv',
              name: 'lv',
              tagImage: '',
              title: 'Latvia',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            mena: {
              path: '/content/cq:tags/caas/country/mena',
              tagID: 'caas:country/mena',
              name: 'mena',
              tagImage: '',
              title: 'Middle East and North Africa',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            mx: {
              path: '/content/cq:tags/caas/country/mx',
              tagID: 'caas:country/mx',
              name: 'mx',
              tagImage: '',
              title: 'Mexico',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            nl: {
              path: '/content/cq:tags/caas/country/nl',
              tagID: 'caas:country/nl',
              name: 'nl',
              tagImage: '',
              title: 'Netherlands',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            no: {
              path: '/content/cq:tags/caas/country/no',
              tagID: 'caas:country/no',
              name: 'no',
              tagImage: '',
              title: 'Norway',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            pl: {
              path: '/content/cq:tags/caas/country/pl',
              tagID: 'caas:country/pl',
              name: 'pl',
              tagImage: '',
              title: 'Poland',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ro: {
              path: '/content/cq:tags/caas/country/ro',
              tagID: 'caas:country/ro',
              name: 'ro',
              tagImage: '',
              title: 'Romania',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            rs: {
              path: '/content/cq:tags/caas/country/rs',
              tagID: 'caas:country/rs',
              name: 'rs',
              tagImage: '',
              title: 'Serbia',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ru: {
              path: '/content/cq:tags/caas/country/ru',
              tagID: 'caas:country/ru',
              name: 'ru',
              tagImage: '',
              title: 'Russia',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            se: {
              path: '/content/cq:tags/caas/country/se',
              tagID: 'caas:country/se',
              name: 'se',
              tagImage: '',
              title: 'Sweden',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            si: {
              path: '/content/cq:tags/caas/country/si',
              tagID: 'caas:country/si',
              name: 'si',
              tagImage: '',
              title: 'Slovenia',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            sk: {
              path: '/content/cq:tags/caas/country/sk',
              tagID: 'caas:country/sk',
              name: 'sk',
              tagImage: '',
              title: 'Slovakia',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            tr: {
              path: '/content/cq:tags/caas/country/tr',
              tagID: 'caas:country/tr',
              name: 'tr',
              tagImage: '',
              title: 'Turkey',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            tw: {
              path: '/content/cq:tags/caas/country/tw',
              tagID: 'caas:country/tw',
              name: 'tw',
              tagImage: '',
              title: 'Taiwan',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ua: {
              path: '/content/cq:tags/caas/country/ua',
              tagID: 'caas:country/ua',
              name: 'ua',
              tagImage: '',
              title: 'Ukraine',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            co: {
              path: '/content/cq:tags/caas/country/co',
              tagID: 'caas:country/co',
              name: 'co',
              tagImage: '',
              title: 'Colombia',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            nz: {
              path: '/content/cq:tags/caas/country/nz',
              tagID: 'caas:country/nz',
              name: 'nz',
              tagImage: '',
              title: 'New Zealand',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            gb: {
              path: '/content/cq:tags/caas/country/gb',
              tagID: 'caas:country/gb',
              name: 'gb',
              tagImage: '',
              title: 'United Kingdom',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ph: {
              path: '/content/cq:tags/caas/country/ph',
              tagID: 'caas:country/ph',
              name: 'ph',
              tagImage: '',
              title: 'Philippine',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ar: {
              path: '/content/cq:tags/caas/country/ar',
              tagID: 'caas:country/ar',
              name: 'ar',
              tagImage: '',
              title: 'Argentina',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            pe: {
              path: '/content/cq:tags/caas/country/pe',
              tagID: 'caas:country/pe',
              name: 'pe',
              tagImage: '',
              title: 'Peru',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            africa: {
              path: '/content/cq:tags/caas/country/africa',
              tagID: 'caas:country/africa',
              name: 'africa',
              tagImage: '',
              title: 'Africa',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            au: {
              path: '/content/cq:tags/caas/country/au',
              tagID: 'caas:country/au',
              name: 'au',
              tagImage: '',
              title: 'Australia',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            cl: {
              path: '/content/cq:tags/caas/country/cl',
              tagID: 'caas:country/cl',
              name: 'cl',
              tagImage: '',
              title: 'Chile',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            cy: {
              path: '/content/cq:tags/caas/country/cy',
              tagID: 'caas:country/cy',
              name: 'cy',
              tagImage: '',
              title: 'Cyprus',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ie: {
              path: '/content/cq:tags/caas/country/ie',
              tagID: 'caas:country/ie',
              name: 'ie',
              tagImage: '',
              title: 'Ireland',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            gr_en: {
              path: '/content/cq:tags/caas/country/gr_en',
              tagID: 'caas:country/gr_en',
              name: 'gr_en',
              tagImage: '',
              title: 'Greece',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            mt: {
              path: '/content/cq:tags/caas/country/mt',
              tagID: 'caas:country/mt',
              name: 'mt',
              tagImage: '',
              title: 'Malta',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            pt: {
              path: '/content/cq:tags/caas/country/pt',
              tagID: 'caas:country/pt',
              name: 'pt',
              tagImage: '',
              title: 'Portugal',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            sa: {
              path: '/content/cq:tags/caas/country/sa',
              tagID: 'caas:country/sa',
              name: 'sa',
              tagImage: '',
              title: 'Saudi Arabia',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ae: {
              path: '/content/cq:tags/caas/country/ae',
              tagID: 'caas:country/ae',
              name: 'ae',
              tagImage: '',
              title: 'United Arab Emirates',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            id: {
              path: '/content/cq:tags/caas/country/id',
              tagID: 'caas:country/id',
              name: 'id',
              tagImage: '',
              title: 'Indonesia',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            in: {
              path: '/content/cq:tags/caas/country/in',
              tagID: 'caas:country/in',
              name: 'in',
              tagImage: '',
              title: 'India',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            my: {
              path: '/content/cq:tags/caas/country/my',
              tagID: 'caas:country/my',
              name: 'my',
              tagImage: '',
              title: 'Malaysia',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            sg: {
              path: '/content/cq:tags/caas/country/sg',
              tagID: 'caas:country/sg',
              name: 'sg',
              tagImage: '',
              title: 'Singapore',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            th: {
              path: '/content/cq:tags/caas/country/th',
              tagID: 'caas:country/th',
              name: 'th',
              tagImage: '',
              title: 'Thailand',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            vn: {
              path: '/content/cq:tags/caas/country/vn',
              tagID: 'caas:country/vn',
              name: 'vn',
              tagImage: '',
              title: 'Vietnam',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        language: {
          path: '/content/cq:tags/caas/language',
          tagID: 'caas:language',
          name: 'language',
          tagImage: '',
          title: 'Language',
          description: '',
          'cq:movedTo': '',
          tags: {
            en: {
              path: '/content/cq:tags/caas/language/en',
              tagID: 'caas:language/en',
              name: 'en',
              tagImage: '',
              title: 'English',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            de: {
              path: '/content/cq:tags/caas/language/de',
              tagID: 'caas:language/de',
              name: 'de',
              tagImage: '',
              title: 'German',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            fr: {
              path: '/content/cq:tags/caas/language/fr',
              tagID: 'caas:language/fr',
              name: 'fr',
              tagImage: '',
              title: 'French',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            nl: {
              path: '/content/cq:tags/caas/language/nl',
              tagID: 'caas:language/nl',
              name: 'nl',
              tagImage: '',
              title: 'Dutch',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            bg: {
              path: '/content/cq:tags/caas/language/bg',
              tagID: 'caas:language/bg',
              name: 'bg',
              tagImage: '',
              title: 'Bulgarian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            pt: {
              path: '/content/cq:tags/caas/language/pt',
              tagID: 'caas:language/pt',
              name: 'pt',
              tagImage: '',
              title: 'Portugese',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            it: {
              path: '/content/cq:tags/caas/language/it',
              tagID: 'caas:language/it',
              name: 'it',
              tagImage: '',
              title: 'Italian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ru: {
              path: '/content/cq:tags/caas/language/ru',
              tagID: 'caas:language/ru',
              name: 'ru',
              tagImage: '',
              title: 'Russian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'zh-Hans': {
              path: '/content/cq:tags/caas/language/zh-Hans',
              tagID: 'caas:language/zh-Hans',
              name: 'zh-Hans',
              tagImage: '',
              title: 'Chinese Simplified',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            cs: {
              path: '/content/cq:tags/caas/language/cs',
              tagID: 'caas:language/cs',
              name: 'cs',
              tagImage: '',
              title: 'Czech',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            da: {
              path: '/content/cq:tags/caas/language/da',
              tagID: 'caas:language/da',
              name: 'da',
              tagImage: '',
              title: 'Danish',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            et: {
              path: '/content/cq:tags/caas/language/et',
              tagID: 'caas:language/et',
              name: 'et',
              tagImage: '',
              title: 'Estonian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            es: {
              path: '/content/cq:tags/caas/language/es',
              tagID: 'caas:language/es',
              name: 'es',
              tagImage: '',
              title: 'Spanish',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            fi: {
              path: '/content/cq:tags/caas/language/fi',
              tagID: 'caas:language/fi',
              name: 'fi',
              tagImage: '',
              title: 'Finnish',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'zh-Hant': {
              path: '/content/cq:tags/caas/language/zh-Hant',
              tagID: 'caas:language/zh-Hant',
              name: 'zh-Hant',
              tagImage: '',
              title: 'Chinese Traditional',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            hr: {
              path: '/content/cq:tags/caas/language/hr',
              tagID: 'caas:language/hr',
              name: 'hr',
              tagImage: '',
              title: 'Croatian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            hu: {
              path: '/content/cq:tags/caas/language/hu',
              tagID: 'caas:language/hu',
              name: 'hu',
              tagImage: '',
              title: 'Hungarian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            he: {
              path: '/content/cq:tags/caas/language/he',
              tagID: 'caas:language/he',
              name: 'he',
              tagImage: '',
              title: 'Hebrew',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ja: {
              path: '/content/cq:tags/caas/language/ja',
              tagID: 'caas:language/ja',
              name: 'ja',
              tagImage: '',
              title: 'Japanese',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ko: {
              path: '/content/cq:tags/caas/language/ko',
              tagID: 'caas:language/ko',
              name: 'ko',
              tagImage: '',
              title: 'Korean',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            lt: {
              path: '/content/cq:tags/caas/language/lt',
              tagID: 'caas:language/lt',
              name: 'lt',
              tagImage: '',
              title: 'Lithuanian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            lv: {
              path: '/content/cq:tags/caas/language/lv',
              tagID: 'caas:language/lv',
              name: 'lv',
              tagImage: '',
              title: 'Latvian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ar: {
              path: '/content/cq:tags/caas/language/ar',
              tagID: 'caas:language/ar',
              name: 'ar',
              tagImage: '',
              title: 'Arabic',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            no: {
              path: '/content/cq:tags/caas/language/no',
              tagID: 'caas:language/no',
              name: 'no',
              tagImage: '',
              title: 'Norwegian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            pl: {
              path: '/content/cq:tags/caas/language/pl',
              tagID: 'caas:language/pl',
              name: 'pl',
              tagImage: '',
              title: 'Polish',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ro: {
              path: '/content/cq:tags/caas/language/ro',
              tagID: 'caas:language/ro',
              name: 'ro',
              tagImage: '',
              title: 'Romanian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            sr: {
              path: '/content/cq:tags/caas/language/sr',
              tagID: 'caas:language/sr',
              name: 'sr',
              tagImage: '',
              title: 'Serbian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            sv: {
              path: '/content/cq:tags/caas/language/sv',
              tagID: 'caas:language/sv',
              name: 'sv',
              tagImage: '',
              title: 'Swedosj',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            sl: {
              path: '/content/cq:tags/caas/language/sl',
              tagID: 'caas:language/sl',
              name: 'sl',
              tagImage: '',
              title: 'Slovenian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            sk: {
              path: '/content/cq:tags/caas/language/sk',
              tagID: 'caas:language/sk',
              name: 'sk',
              tagImage: '',
              title: 'Slovakian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            tr: {
              path: '/content/cq:tags/caas/language/tr',
              tagID: 'caas:language/tr',
              name: 'tr',
              tagImage: '',
              title: 'Turkish',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            uk: {
              path: '/content/cq:tags/caas/language/uk',
              tagID: 'caas:language/uk',
              name: 'uk',
              tagImage: '',
              title: 'Ukrainian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            hi: {
              path: '/content/cq:tags/caas/language/hi',
              tagID: 'caas:language/hi',
              name: 'hi',
              tagImage: '',
              title: 'Hindi',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            ms: {
              path: '/content/cq:tags/caas/language/ms',
              tagID: 'caas:language/ms',
              name: 'ms',
              tagImage: '',
              title: 'Malay',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            fil: {
              path: '/content/cq:tags/caas/language/fil',
              tagID: 'caas:language/fil',
              name: 'fil',
              tagImage: '',
              title: 'Filipino',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            th: {
              path: '/content/cq:tags/caas/language/th',
              tagID: 'caas:language/th',
              name: 'th',
              tagImage: '',
              title: 'Thai',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            vi: {
              path: '/content/cq:tags/caas/language/vi',
              tagID: 'caas:language/vi',
              name: 'vi',
              tagImage: '',
              title: 'Vietnamese',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            indonesian: {
              path: '/content/cq:tags/caas/language/indonesian',
              tagID: 'caas:language/indonesian',
              name: 'indonesian',
              tagImage: '',
              title: 'Indonesian',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        source: {
          path: '/content/cq:tags/caas/source',
          tagID: 'caas:source',
          name: 'source',
          tagImage: '',
          title: 'Source',
          description: '',
          'cq:movedTo': '',
          tags: {
            'build-info': {
              path: '/content/cq:tags/caas/source/build-info',
              tagID: 'caas:source/build-info',
              name: 'build-info',
              tagImage: '',
              title: 'Build Info',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            northstar: {
              path: '/content/cq:tags/caas/source/northstar',
              tagID: 'caas:source/northstar',
              name: 'northstar',
              tagImage: '',
              title: 'Northstar',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            hawks: {
              path: '/content/cq:tags/caas/source/hawks',
              tagID: 'caas:source/hawks',
              name: 'hawks',
              tagImage: '',
              title: 'Hawks',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            doccloud: {
              path: '/content/cq:tags/caas/source/doccloud',
              tagID: 'caas:source/doccloud',
              name: 'doccloud',
              tagImage: '',
              title: 'DocCloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            marketo: {
              path: '/content/cq:tags/caas/source/marketo',
              tagID: 'caas:source/marketo',
              name: 'marketo',
              tagImage: '',
              title: 'Marketo',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            magento: {
              path: '/content/cq:tags/caas/source/magento',
              tagID: 'caas:source/magento',
              name: 'magento',
              tagImage: '',
              title: 'Magento',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            workfront: {
              path: '/content/cq:tags/caas/source/workfront',
              tagID: 'caas:source/workfront',
              name: 'workfront',
              tagImage: '',
              title: 'Workfront',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            experienceleague: {
              path: '/content/cq:tags/caas/source/experienceleague',
              tagID: 'caas:source/experienceleague',
              name: 'experienceleague',
              tagImage: '',
              title: 'ExperienceLeague',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            gravity: {
              path: '/content/cq:tags/caas/source/gravity',
              tagID: 'caas:source/gravity',
              name: 'gravity',
              tagImage: '',
              title: 'Gravity',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            bacom: {
              path: '/content/cq:tags/caas/source/bacom',
              tagID: 'caas:source/bacom',
              name: 'bacom',
              tagImage: '',
              title: 'Bacom',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            milo: {
              path: '/content/cq:tags/caas/source/milo',
              tagID: 'caas:source/milo',
              name: 'milo',
              tagImage: '',
              title: 'milo',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            express: {
              path: '/content/cq:tags/caas/source/express',
              tagID: 'caas:source/express',
              name: 'express',
              tagImage: '',
              title: 'Express',
              description: 'adobe.com/express source tag',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        products: {
          path: '/content/cq:tags/caas/products',
          tagID: 'caas:products',
          name: 'products',
          tagImage: '',
          title: 'Products',
          'title.zh_cn': '产品',
          'title.pt': 'Produtos',
          'title.fr': 'Produits',
          'title.ja': '製品',
          'title.zh_tw': '產品',
          'title.it': 'Prodotti',
          'title.ko': '제품',
          'title.de': 'Produkte',
          'title.es': 'Productos',
          'title.hi': 'प्रोडक्ट',
          'title.sv': 'Produkter',
          'title.nl': 'Producten',
          'title.th': 'ผลิตภัณฑ์',
          description: '',
          'cq:movedTo': '',
          tags: {
            acrobat: {
              path: '/content/cq:tags/caas/products/acrobat',
              tagID: 'caas:products/acrobat',
              name: 'acrobat',
              tagImage: '',
              title: 'Adobe Acrobat',
              'title.ja': 'Acrobat',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'after-effects': {
              path: '/content/cq:tags/caas/products/after-effects',
              tagID: 'caas:products/after-effects',
              name: 'after-effects',
              tagImage: '',
              title: 'After Effects',
              'title.ja': 'After Effects',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            audition: {
              path: '/content/cq:tags/caas/products/audition',
              tagID: 'caas:products/audition',
              name: 'audition',
              tagImage: '',
              title: 'Audition',
              'title.ja': 'Audition',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            bridge: {
              path: '/content/cq:tags/caas/products/bridge',
              tagID: 'caas:products/bridge',
              name: 'bridge',
              tagImage: '',
              title: 'Bridge',
              'title.ja': 'Bridge',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'character-animator': {
              path: '/content/cq:tags/caas/products/character-animator',
              tagID: 'caas:products/character-animator',
              name: 'character-animator',
              tagImage: '',
              title: 'Character Animator',
              'title.ja': 'Character Animator',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            dimension: {
              path: '/content/cq:tags/caas/products/dimension',
              tagID: 'caas:products/dimension',
              name: 'dimension',
              tagImage: '',
              title: 'Dimension',
              'title.ja': 'Dimension',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-fresco': {
              path: '/content/cq:tags/caas/products/adobe-fresco',
              tagID: 'caas:products/adobe-fresco',
              name: 'adobe-fresco',
              tagImage: '',
              title: 'Adobe Fresco',
              'title.ja': 'Adobe Fresco',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            indesign: {
              path: '/content/cq:tags/caas/products/indesign',
              tagID: 'caas:products/indesign',
              name: 'indesign',
              tagImage: '',
              title: 'InDesign',
              'title.ja': 'InDesign',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'lightroom-classic': {
              path: '/content/cq:tags/caas/products/lightroom-classic',
              tagID: 'caas:products/lightroom-classic',
              name: 'lightroom-classic',
              tagImage: '',
              title: 'Lightroom Classic',
              'title.ja': 'Lightroom Classic',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'medium-by-adobe': {
              path: '/content/cq:tags/caas/products/medium-by-adobe',
              tagID: 'caas:products/medium-by-adobe',
              name: 'medium-by-adobe',
              tagImage: '',
              title: 'Medium by Adobe',
              'title.ja': 'Medium by Adobe',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'pdf-sdk': {
              path: '/content/cq:tags/caas/products/pdf-sdk',
              tagID: 'caas:products/pdf-sdk',
              name: 'pdf-sdk',
              tagImage: '',
              title: 'PDF SDK',
              'title.ja': 'PDF SDK',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'photoshop-camera': {
              path: '/content/cq:tags/caas/products/photoshop-camera',
              tagID: 'caas:products/photoshop-camera',
              name: 'photoshop-camera',
              tagImage: '',
              title: 'Photoshop Camera',
              'title.ja': 'Photoshop Camera',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'premiere-pro': {
              path: '/content/cq:tags/caas/products/premiere-pro',
              tagID: 'caas:products/premiere-pro',
              name: 'premiere-pro',
              tagImage: '',
              title: 'Premiere Pro',
              'title.ja': 'Premiere Pro',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            reader: {
              path: '/content/cq:tags/caas/products/reader',
              tagID: 'caas:products/reader',
              name: 'reader',
              tagImage: '',
              title: 'Reader',
              'title.ja': 'Reader',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-sign': {
              path: '/content/cq:tags/caas/products/adobe-sign',
              tagID: 'caas:products/adobe-sign',
              name: 'adobe-sign',
              tagImage: '',
              title: 'Adobe Acrobat Sign',
              'title.ja': 'Adobe Sign',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-stock': {
              path: '/content/cq:tags/caas/products/adobe-stock',
              tagID: 'caas:products/adobe-stock',
              name: 'adobe-stock',
              tagImage: '',
              title: 'Adobe Stock',
              'title.ja': 'Adobe Stock',
              description: '',
              'cq:movedTo': '',
              tags: {
                'artist-hub': {
                  path: '/content/cq:tags/caas/products/adobe-stock/artist-hub',
                  tagID: 'caas:products/adobe-stock/artist-hub',
                  name: 'artist-hub',
                  tagImage: '',
                  title: 'Artist Hub',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
              },
            },
            'substance-painter': {
              path: '/content/cq:tags/caas/products/substance-painter',
              tagID: 'caas:products/substance-painter',
              name: 'substance-painter',
              tagImage: '',
              title: 'Substance Painter',
              'title.ja': 'Substance Painter',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            xd: {
              path: '/content/cq:tags/caas/products/xd',
              tagID: 'caas:products/xd',
              name: 'xd',
              tagImage: '',
              title: 'XD',
              'title.ja': 'XD',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            aero: {
              path: '/content/cq:tags/caas/products/aero',
              tagID: 'caas:products/aero',
              name: 'aero',
              tagImage: '',
              title: 'Aero',
              'title.ja': 'Aero',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            animate: {
              path: '/content/cq:tags/caas/products/animate',
              tagID: 'caas:products/animate',
              name: 'animate',
              tagImage: '',
              title: 'Animate',
              'title.ja': 'Animate',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            behance: {
              path: '/content/cq:tags/caas/products/behance',
              tagID: 'caas:products/behance',
              name: 'behance',
              tagImage: '',
              title: 'Behance',
              'title.ja': 'Behance',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            capture: {
              path: '/content/cq:tags/caas/products/capture',
              tagID: 'caas:products/capture',
              name: 'capture',
              tagImage: '',
              title: 'Capture',
              'title.ja': 'Capture',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'creative-cloud': {
              path: '/content/cq:tags/caas/products/creative-cloud',
              tagID: 'caas:products/creative-cloud',
              name: 'creative-cloud',
              tagImage: '',
              title: 'Creative Cloud',
              'title.ja': 'Creative Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-fonts': {
              path: '/content/cq:tags/caas/products/adobe-fonts',
              tagID: 'caas:products/adobe-fonts',
              name: 'adobe-fonts',
              tagImage: '',
              title: 'Adobe Fonts',
              'title.ja': 'Adobe Fonts',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            illustrator: {
              path: '/content/cq:tags/caas/products/illustrator',
              tagID: 'caas:products/illustrator',
              name: 'illustrator',
              tagImage: '',
              title: 'Illustrator',
              'title.ja': 'Illustrator',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            lightroom: {
              path: '/content/cq:tags/caas/products/lightroom',
              tagID: 'caas:products/lightroom',
              name: 'lightroom',
              tagImage: '',
              title: 'Lightroom',
              'title.ja': 'Lightroom',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'lightroom-on-mobile': {
              path: '/content/cq:tags/caas/products/lightroom-on-mobile',
              tagID: 'caas:products/lightroom-on-mobile',
              name: 'lightroom-on-mobile',
              tagImage: '',
              title: 'Lightroom on mobile',
              'title.ja': 'モバイル版Lightroom',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'not-product-specific': {
              path: '/content/cq:tags/caas/products/not-product-specific',
              tagID: 'caas:products/not-product-specific',
              name: 'not-product-specific',
              tagImage: '',
              title: 'Not Product Specific',
              'title.ja': '特化製品なし',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            photoshop: {
              path: '/content/cq:tags/caas/products/photoshop',
              tagID: 'caas:products/photoshop',
              name: 'photoshop',
              tagImage: '',
              title: 'Photoshop',
              'title.ja': 'Photoshop',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            portfolio: {
              path: '/content/cq:tags/caas/products/portfolio',
              tagID: 'caas:products/portfolio',
              name: 'portfolio',
              tagImage: '',
              title: 'Portfolio',
              'title.ja': 'Portfolio',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'premiere-rush': {
              path: '/content/cq:tags/caas/products/premiere-rush',
              tagID: 'caas:products/premiere-rush',
              name: 'premiere-rush',
              tagImage: '',
              title: 'Premiere Rush',
              'title.ja': 'Premiere Rush',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-scan': {
              path: '/content/cq:tags/caas/products/adobe-scan',
              tagID: 'caas:products/adobe-scan',
              name: 'adobe-scan',
              tagImage: '',
              title: 'Adobe Scan',
              'title.ja': 'Adobe Scan',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-spark': {
              path: '/content/cq:tags/caas/products/adobe-spark',
              tagID: 'caas:products/adobe-spark',
              name: 'adobe-spark',
              tagImage: '',
              title: 'Adobe Spark',
              'title.ja': 'Adobe Spark',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-alchemist': {
              path: '/content/cq:tags/caas/products/substance-alchemist',
              tagID: 'caas:products/substance-alchemist',
              name: 'substance-alchemist',
              tagImage: '',
              title: 'Substance Alchemist',
              'title.ja': 'Substance Alchemist',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-source': {
              path: '/content/cq:tags/caas/products/substance-source',
              tagID: 'caas:products/substance-source',
              name: 'substance-source',
              tagImage: '',
              title: 'Substance Source',
              'title.ja': 'Substance Source',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'pdf-api': {
              path: '/content/cq:tags/caas/products/pdf-api',
              tagID: 'caas:products/pdf-api',
              name: 'pdf-api',
              tagImage: '',
              title: 'PDF API',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            preview: {
              path: '/content/cq:tags/caas/products/preview',
              tagID: 'caas:products/preview',
              name: 'preview',
              tagImage: '',
              title: 'Preview',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            substance: {
              path: '/content/cq:tags/caas/products/substance',
              tagID: 'caas:products/substance',
              name: 'substance',
              tagImage: '',
              title: 'Substance',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-advertising-cloud': {
              path: '/content/cq:tags/caas/products/adobe-advertising-cloud',
              tagID: 'caas:products/adobe-advertising-cloud',
              name: 'adobe-advertising-cloud',
              tagImage: '',
              title: 'Adobe Advertising Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-analytics': {
              path: '/content/cq:tags/caas/products/adobe-analytics',
              tagID: 'caas:products/adobe-analytics',
              name: 'adobe-analytics',
              tagImage: '',
              title: 'Adobe Analytics',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-audience-manager': {
              path: '/content/cq:tags/caas/products/adobe-audience-manager',
              tagID: 'caas:products/adobe-audience-manager',
              name: 'adobe-audience-manager',
              tagImage: '',
              title: 'Adobe Audience Manager',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-campaign': {
              path: '/content/cq:tags/caas/products/adobe-campaign',
              tagID: 'caas:products/adobe-campaign',
              name: 'adobe-campaign',
              tagImage: '',
              title: 'Adobe Campaign',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-commerce-cloud': {
              path: '/content/cq:tags/caas/products/adobe-commerce-cloud',
              tagID: 'caas:products/adobe-commerce-cloud',
              name: 'adobe-commerce-cloud',
              tagImage: '',
              title: 'Adobe Commerce Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-creative-cloud': {
              path: '/content/cq:tags/caas/products/adobe-creative-cloud',
              tagID: 'caas:products/adobe-creative-cloud',
              name: 'adobe-creative-cloud',
              tagImage: '',
              title: 'Adobe Creative Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-document-cloud': {
              path: '/content/cq:tags/caas/products/adobe-document-cloud',
              tagID: 'caas:products/adobe-document-cloud',
              name: 'adobe-document-cloud',
              tagImage: '',
              title: 'Adobe Document Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-experience-manager': {
              path: '/content/cq:tags/caas/products/adobe-experience-manager',
              tagID: 'caas:products/adobe-experience-manager',
              name: 'adobe-experience-manager',
              tagImage: '',
              title: 'Adobe Experience Manager',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-experience-cloud': {
              path: '/content/cq:tags/caas/products/adobe-experience-cloud',
              tagID: 'caas:products/adobe-experience-cloud',
              name: 'adobe-experience-cloud',
              tagImage: '',
              title: 'Adobe Experience Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-experience-platform': {
              path: '/content/cq:tags/caas/products/adobe-experience-platform',
              tagID: 'caas:products/adobe-experience-platform',
              name: 'adobe-experience-platform',
              tagImage: '',
              title: 'Adobe Experience Platform',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-primetime': {
              path: '/content/cq:tags/caas/products/adobe-primetime',
              tagID: 'caas:products/adobe-primetime',
              name: 'adobe-primetime',
              tagImage: '',
              title: 'Adobe Primetime',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-sensei': {
              path: '/content/cq:tags/caas/products/adobe-sensei',
              tagID: 'caas:products/adobe-sensei',
              name: 'adobe-sensei',
              tagImage: '',
              title: 'Adobe Sensei',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-target': {
              path: '/content/cq:tags/caas/products/adobe-target',
              tagID: 'caas:products/adobe-target',
              name: 'adobe-target',
              tagImage: '',
              title: 'Adobe Target',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'magento-business-intelligence': {
              path: '/content/cq:tags/caas/products/magento-business-intelligence',
              tagID: 'caas:products/magento-business-intelligence',
              name: 'magento-business-intelligence',
              tagImage: '',
              title: 'Magento Business Intelligence',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'magento-commerce': {
              path: '/content/cq:tags/caas/products/magento-commerce',
              tagID: 'caas:products/magento-commerce',
              name: 'magento-commerce',
              tagImage: '',
              title: 'Magento Commerce',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'magento-order-management': {
              path: '/content/cq:tags/caas/products/magento-order-management',
              tagID: 'caas:products/magento-order-management',
              name: 'magento-order-management',
              tagImage: '',
              title: 'Magento Order Management',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'marketo-engage-bizible': {
              path: '/content/cq:tags/caas/products/marketo-engage-bizible',
              tagID: 'caas:products/marketo-engage-bizible',
              name: 'marketo-engage-bizible',
              tagImage: '',
              title: 'Marketo Engage',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            workfront: {
              path: '/content/cq:tags/caas/products/workfront',
              tagID: 'caas:products/workfront',
              name: 'workfront',
              tagImage: '',
              title: 'Adobe Workfront',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-commerce': {
              path: '/content/cq:tags/caas/products/adobe-commerce',
              tagID: 'caas:products/adobe-commerce',
              name: 'adobe-commerce',
              tagImage: '',
              title: 'Adobe Commerce',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'creative-cloud-express': {
              path: '/content/cq:tags/caas/products/creative-cloud-express',
              tagID: 'caas:products/creative-cloud-express',
              name: 'creative-cloud-express',
              tagImage: '',
              title: 'Creative Cloud Express',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'creative-cloud-libraries': {
              path: '/content/cq:tags/caas/products/creative-cloud-libraries',
              tagID: 'caas:products/creative-cloud-libraries',
              name: 'creative-cloud-libraries',
              tagImage: '',
              title: 'Creative Cloud Libraries',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'premiere-express': {
              path: '/content/cq:tags/caas/products/premiere-express',
              tagID: 'caas:products/premiere-express',
              name: 'premiere-express',
              tagImage: '',
              title: 'Premiere Express',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-3d-assets': {
              path: '/content/cq:tags/caas/products/substance-3d-assets',
              tagID: 'caas:products/substance-3d-assets',
              name: 'substance-3d-assets',
              tagImage: '',
              title: 'Substance 3D Assets',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-3d-designer': {
              path: '/content/cq:tags/caas/products/substance-3d-designer',
              tagID: 'caas:products/substance-3d-designer',
              name: 'substance-3d-designer',
              tagImage: '',
              title: 'Substance 3D Designer',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-3d-modeler': {
              path: '/content/cq:tags/caas/products/substance-3d-modeler',
              tagID: 'caas:products/substance-3d-modeler',
              name: 'substance-3d-modeler',
              tagImage: '',
              title: 'Substance 3D Modeler',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-3d-painter': {
              path: '/content/cq:tags/caas/products/substance-3d-painter',
              tagID: 'caas:products/substance-3d-painter',
              name: 'substance-3d-painter',
              tagImage: '',
              title: 'Substance 3D Painter',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-3d-sampler': {
              path: '/content/cq:tags/caas/products/substance-3d-sampler',
              tagID: 'caas:products/substance-3d-sampler',
              name: 'substance-3d-sampler',
              tagImage: '',
              title: 'Substance 3D Sampler',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-3d-stager': {
              path: '/content/cq:tags/caas/products/substance-3d-stager',
              tagID: 'caas:products/substance-3d-stager',
              name: 'substance-3d-stager',
              tagImage: '',
              title: 'Substance 3D Stager',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'photoshop-express': {
              path: '/content/cq:tags/caas/products/photoshop-express',
              tagID: 'caas:products/photoshop-express',
              name: 'photoshop-express',
              tagImage: '',
              title: 'Photoshop Express',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'media-encoder': {
              path: '/content/cq:tags/caas/products/media-encoder',
              tagID: 'caas:products/media-encoder',
              name: 'media-encoder',
              tagImage: '',
              title: 'Media Encoder',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-experience-manager-sites': {
              path: '/content/cq:tags/caas/products/adobe-experience-manager-sites',
              tagID: 'caas:products/adobe-experience-manager-sites',
              name: 'adobe-experience-manager-sites',
              tagImage: '',
              title: 'Adobe Experience Manager Sites',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-experience-manager-forms': {
              path: '/content/cq:tags/caas/products/adobe-experience-manager-forms',
              tagID: 'caas:products/adobe-experience-manager-forms',
              name: 'adobe-experience-manager-forms',
              tagImage: '',
              title: 'Adobe Experience Manager Forms',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-experience-manager-assets': {
              path: '/content/cq:tags/caas/products/adobe-experience-manager-assets',
              tagID: 'caas:products/adobe-experience-manager-assets',
              name: 'adobe-experience-manager-assets',
              tagImage: '',
              title: 'Adobe Experience Manager Assets',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-real-time-cdp': {
              path: '/content/cq:tags/caas/products/adobe-real-time-cdp',
              tagID: 'caas:products/adobe-real-time-cdp',
              name: 'adobe-real-time-cdp',
              tagImage: '',
              title: 'Adobe Real-time CDP',
              description: 'DX Enterprise Adobe Real-time Customer Data Platform',
              'cq:movedTo': '',
              tags: {},
            },
            'creative-cloud-for-teams': {
              path: '/content/cq:tags/caas/products/creative-cloud-for-teams',
              tagID: 'caas:products/creative-cloud-for-teams',
              name: 'creative-cloud-for-teams',
              tagImage: '',
              title: 'Creative Cloud for teams',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-3d-collection': {
              path: '/content/cq:tags/caas/products/substance-3d-collection',
              tagID: 'caas:products/substance-3d-collection',
              name: 'substance-3d-collection',
              tagImage: '',
              title: 'Substance 3D Collection',
              description: 'Substance 3D Collection for teams',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-journey-optimizer': {
              path: '/content/cq:tags/caas/products/adobe-journey-optimizer',
              tagID: 'caas:products/adobe-journey-optimizer',
              name: 'adobe-journey-optimizer',
              tagImage: '',
              title: 'Adobe Journey Optimizer',
              description: 'DX Adobe Journey Optimizer',
              'cq:movedTo': '',
              tags: {},
            },
            'creative-cloud-for-enterprise': {
              path: '/content/cq:tags/caas/products/creative-cloud-for-enterprise',
              tagID: 'caas:products/creative-cloud-for-enterprise',
              name: 'creative-cloud-for-enterprise',
              tagImage: '',
              title: 'Creative Cloud for enterprise',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'experience-manager-cloud-service': {
              path: '/content/cq:tags/caas/products/experience-manager-cloud-service',
              tagID: 'caas:products/experience-manager-cloud-service',
              name: 'experience-manager-cloud-service',
              tagImage: '',
              title: 'Experience Manager Cloud Service',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'experience-manager-managed-service': {
              path: '/content/cq:tags/caas/products/experience-manager-managed-service',
              tagID: 'caas:products/experience-manager-managed-service',
              name: 'experience-manager-managed-service',
              tagImage: '',
              title: 'Experience Manager Managed Service',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            connect: {
              path: '/content/cq:tags/caas/products/connect',
              tagID: 'caas:products/connect',
              name: 'connect',
              tagImage: '',
              title: 'Connect',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            captivate: {
              path: '/content/cq:tags/caas/products/captivate',
              tagID: 'caas:products/captivate',
              name: 'captivate',
              tagImage: '',
              title: 'Captivate',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'marketo-measure': {
              path: '/content/cq:tags/caas/products/marketo-measure',
              tagID: 'caas:products/marketo-measure',
              name: 'marketo-measure',
              tagImage: '',
              title: 'Marketo Measure',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'customer-journey-analytics': {
              path: '/content/cq:tags/caas/products/customer-journey-analytics',
              tagID: 'caas:products/customer-journey-analytics',
              name: 'customer-journey-analytics',
              tagImage: '',
              title: 'Customer Journey Analytics',
              description: 'DX customer journey analytics',
              'cq:movedTo': '',
              tags: {},
            },
            'learning-manager': {
              path: '/content/cq:tags/caas/products/learning-manager',
              tagID: 'caas:products/learning-manager',
              name: 'learning-manager',
              tagImage: '',
              title: 'Learning Manager',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'frame-io': {
              path: '/content/cq:tags/caas/products/frame-io',
              tagID: 'caas:products/frame-io',
              name: 'frame-io',
              tagImage: '',
              title: 'Frame.io',
              description: 'New product tag for Frame.io',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-consulting-services': {
              path: '/content/cq:tags/caas/products/adobe-consulting-services',
              tagID: 'caas:products/adobe-consulting-services',
              name: 'adobe-consulting-services',
              tagImage: '',
              title: 'Adobe Consulting Services (ACS)',
              description: 'DX Adobe Consulting Services (ACS)',
              'cq:movedTo': '',
              tags: {},
            },
            'experience-manager-guides': {
              path: '/content/cq:tags/caas/products/experience-manager-guides',
              tagID: 'caas:products/experience-manager-guides',
              name: 'experience-manager-guides',
              tagImage: '',
              title: 'Experience Manager Guides',
              description: 'Adobe Experience Manager Guides',
              'cq:movedTo': '',
              tags: {},
            },
            'professional-services': {
              path: '/content/cq:tags/caas/products/professional-services',
              tagID: 'caas:products/professional-services',
              name: 'professional-services',
              tagImage: '',
              title: 'Professional Services',
              description: 'Adobe Professional Services',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-customer-solutions': {
              path: '/content/cq:tags/caas/products/adobe-customer-solutions',
              tagID: 'caas:products/adobe-customer-solutions',
              name: 'adobe-customer-solutions',
              tagImage: '',
              title: 'Adobe Customer Solutions',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'journey-orchestration': {
              path: '/content/cq:tags/caas/products/journey-orchestration',
              tagID: 'caas:products/journey-orchestration',
              name: 'journey-orchestration',
              tagImage: '',
              title: 'Journey Orchestration',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            services: {
              path: '/content/cq:tags/caas/products/services',
              tagID: 'caas:products/services',
              name: 'services',
              tagImage: '',
              title: 'Services',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            stock: {
              path: '/content/cq:tags/caas/products/stock',
              tagID: 'caas:products/stock',
              name: 'stock',
              tagImage: '',
              title: 'Stock',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-plugins': {
              path: '/content/cq:tags/caas/products/substance-plugins',
              tagID: 'caas:products/substance-plugins',
              name: 'substance-plugins',
              tagImage: '',
              title: 'Substance Plugins',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'project-sunrise': {
              path: '/content/cq:tags/caas/products/project-sunrise',
              tagID: 'caas:products/project-sunrise',
              name: 'project-sunrise',
              tagImage: '',
              title: 'Project Sunrise',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-standard-material': {
              path: '/content/cq:tags/caas/products/adobe-standard-material',
              tagID: 'caas:products/adobe-standard-material',
              name: 'adobe-standard-material',
              tagImage: '',
              title: 'Adobe Standard Material',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-product-analytics': {
              path: '/content/cq:tags/caas/products/adobe-product-analytics',
              tagID: 'caas:products/adobe-product-analytics',
              name: 'adobe-product-analytics',
              tagImage: '',
              title: 'Adobe Product Analytics',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-acrobat-services': {
              path: '/content/cq:tags/caas/products/adobe-acrobat-services',
              tagID: 'caas:products/adobe-acrobat-services',
              name: 'adobe-acrobat-services',
              tagImage: '',
              title: 'Adobe Acrobat Services',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            Firefly: {
              path: '/content/cq:tags/caas/products/Firefly',
              tagID: 'caas:products/Firefly',
              name: 'Firefly',
              tagImage: '',
              title: 'Firefly',
              description: 'Firefly Product CaaS tag',
              'cq:movedTo': '',
              tags: {},
            },
            genstudio: {
              path: '/content/cq:tags/caas/products/genstudio',
              tagID: 'caas:products/genstudio',
              name: 'genstudio',
              tagImage: '',
              title: 'GenStudio',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-journey-optimizer---b2b-edition': {
              path: '/content/cq:tags/caas/products/adobe-journey-optimizer---b2b-edition',
              tagID: 'caas:products/adobe-journey-optimizer---b2b-edition',
              name: 'adobe-journey-optimizer---b2b-edition',
              tagImage: '',
              title: 'Adobe Journey Optimizer - B2B Edition',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'content-supply-chain': {
              path: '/content/cq:tags/caas/products/content-supply-chain',
              tagID: 'caas:products/content-supply-chain',
              name: 'content-supply-chain',
              tagImage: '',
              title: 'Content Supply Chain',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        'product-categories': {
          path: '/content/cq:tags/caas/product-categories',
          tagID: 'caas:product-categories',
          name: 'product-categories',
          tagImage: '',
          title: 'Product Categories',
          description: '',
          'cq:movedTo': '',
          tags: {
            photo: {
              path: '/content/cq:tags/caas/product-categories/photo',
              tagID: 'caas:product-categories/photo',
              name: 'photo',
              tagImage: '',
              title: 'Photo',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'graphic-design': {
              path: '/content/cq:tags/caas/product-categories/graphic-design',
              tagID: 'caas:product-categories/graphic-design',
              name: 'graphic-design',
              tagImage: '',
              title: 'Graphic Design',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            video: {
              path: '/content/cq:tags/caas/product-categories/video',
              tagID: 'caas:product-categories/video',
              name: 'video',
              tagImage: '',
              title: 'Video',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            illustration: {
              path: '/content/cq:tags/caas/product-categories/illustration',
              tagID: 'caas:product-categories/illustration',
              name: 'illustration',
              tagImage: '',
              title: 'Illustration',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'ui-and-ux': {
              path: '/content/cq:tags/caas/product-categories/ui-and-ux',
              tagID: 'caas:product-categories/ui-and-ux',
              name: 'ui-and-ux',
              tagImage: '',
              title: 'UI and UX',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'acrobat-and-pdf': {
              path: '/content/cq:tags/caas/product-categories/acrobat-and-pdf',
              tagID: 'caas:product-categories/acrobat-and-pdf',
              name: 'acrobat-and-pdf',
              tagImage: '',
              title: 'Acrobat and PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            '3d-and-ar': {
              path: '/content/cq:tags/caas/product-categories/3d-and-ar',
              tagID: 'caas:product-categories/3d-and-ar',
              name: '3d-and-ar',
              tagImage: '',
              title: '3D and AR',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'social-media': {
              path: '/content/cq:tags/caas/product-categories/social-media',
              tagID: 'caas:product-categories/social-media',
              name: 'social-media',
              tagImage: '',
              title: 'Social Media',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        mnemonics: {
          path: '/content/cq:tags/caas/mnemonics',
          tagID: 'caas:mnemonics',
          name: 'mnemonics',
          tagImage: '',
          title: 'Mnemonics',
          description: '',
          'cq:movedTo': '',
          tags: {
            acrobat: {
              path: '/content/cq:tags/caas/mnemonics/acrobat',
              tagID: 'caas:mnemonics/acrobat',
              name: 'acrobat',
              tagImage: 'https://www.adobe.com/content/dam/shared/images/product-icons/svg/acrobat-reader.svg',
              title: 'Acrobat',
              'title.ja': 'Acrobat',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'after-effects': {
              path: '/content/cq:tags/caas/mnemonics/after-effects',
              tagID: 'caas:mnemonics/after-effects',
              name: 'after-effects',
              tagImage: 'https://www.adobe.com/content/dam/shared/images/product-icons/svg/after-effects.svg',
              title: 'After Effects',
              'title.ja': 'After Effects',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            audition: {
              path: '/content/cq:tags/caas/mnemonics/audition',
              tagID: 'caas:mnemonics/audition',
              name: 'audition',
              tagImage: 'https://www.adobe.com/content/dam/shared/images/product-icons/svg/audition.svg',
              title: 'Audition',
              'title.ja': 'Audition',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            bridge: {
              path: '/content/cq:tags/caas/mnemonics/bridge',
              tagID: 'caas:mnemonics/bridge',
              name: 'bridge',
              tagImage: 'https://www.adobe.com/content/dam/shared/images/product-icons/svg/bridge.svg',
              title: 'Bridge',
              'title.ja': 'Bridge',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'character-animator': {
              path: '/content/cq:tags/caas/mnemonics/character-animator',
              tagID: 'caas:mnemonics/character-animator',
              name: 'character-animator',
              tagImage: '',
              title: 'Character Animator',
              'title.ja': 'Character Animator',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            dimension: {
              path: '/content/cq:tags/caas/mnemonics/dimension',
              tagID: 'caas:mnemonics/dimension',
              name: 'dimension',
              tagImage: '',
              title: 'Dimension',
              'title.ja': 'Dimension',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-fresco': {
              path: '/content/cq:tags/caas/mnemonics/adobe-fresco',
              tagID: 'caas:mnemonics/adobe-fresco',
              name: 'adobe-fresco',
              tagImage: '',
              title: 'Adobe Fresco',
              'title.ja': 'Adobe Fresco',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            indesign: {
              path: '/content/cq:tags/caas/mnemonics/indesign',
              tagID: 'caas:mnemonics/indesign',
              name: 'indesign',
              tagImage: '',
              title: 'InDesign',
              'title.ja': 'InDesign',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'lightroom-classic': {
              path: '/content/cq:tags/caas/mnemonics/lightroom-classic',
              tagID: 'caas:mnemonics/lightroom-classic',
              name: 'lightroom-classic',
              tagImage: '',
              title: 'Lightroom Classic',
              'title.ja': 'Lightroom Classic',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'medium-by-adobe': {
              path: '/content/cq:tags/caas/mnemonics/medium-by-adobe',
              tagID: 'caas:mnemonics/medium-by-adobe',
              name: 'medium-by-adobe',
              tagImage: '',
              title: 'Medium by Adobe',
              'title.ja': 'Medium by Adobe',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'pdf-sdk': {
              path: '/content/cq:tags/caas/mnemonics/pdf-sdk',
              tagID: 'caas:mnemonics/pdf-sdk',
              name: 'pdf-sdk',
              tagImage: '',
              title: 'PDF SDK',
              'title.ja': 'PDF SDK',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'photoshop-camera': {
              path: '/content/cq:tags/caas/mnemonics/photoshop-camera',
              tagID: 'caas:mnemonics/photoshop-camera',
              name: 'photoshop-camera',
              tagImage: '',
              title: 'Photoshop Camera',
              'title.ja': 'Photoshop Camera',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'premiere-pro': {
              path: '/content/cq:tags/caas/mnemonics/premiere-pro',
              tagID: 'caas:mnemonics/premiere-pro',
              name: 'premiere-pro',
              tagImage: '',
              title: 'Premiere Pro',
              'title.ja': 'Premiere Pro',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            reader: {
              path: '/content/cq:tags/caas/mnemonics/reader',
              tagID: 'caas:mnemonics/reader',
              name: 'reader',
              tagImage: '',
              title: 'Reader',
              'title.ja': 'Reader',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-sign': {
              path: '/content/cq:tags/caas/mnemonics/adobe-sign',
              tagID: 'caas:mnemonics/adobe-sign',
              name: 'adobe-sign',
              tagImage: '',
              title: 'Adobe Sign',
              'title.ja': 'Adobe Sign',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-stock': {
              path: '/content/cq:tags/caas/mnemonics/adobe-stock',
              tagID: 'caas:mnemonics/adobe-stock',
              name: 'adobe-stock',
              tagImage: '',
              title: 'Adobe Stock',
              'title.ja': 'Adobe Stock',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-painter': {
              path: '/content/cq:tags/caas/mnemonics/substance-painter',
              tagID: 'caas:mnemonics/substance-painter',
              name: 'substance-painter',
              tagImage: '',
              title: 'Substance Painter',
              'title.ja': 'Substance Painter',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            xd: {
              path: '/content/cq:tags/caas/mnemonics/xd',
              tagID: 'caas:mnemonics/xd',
              name: 'xd',
              tagImage: 'https://www.adobe.com/content/dam/cc/us/en/products/xd/max2021-home/Adobe-XD-Logo-White.svg',
              title: 'XD',
              'title.ja': 'XD',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            aero: {
              path: '/content/cq:tags/caas/mnemonics/aero',
              tagID: 'caas:mnemonics/aero',
              name: 'aero',
              tagImage: '',
              title: 'Aero',
              'title.ja': 'Aero',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            animate: {
              path: '/content/cq:tags/caas/mnemonics/animate',
              tagID: 'caas:mnemonics/animate',
              name: 'animate',
              tagImage: '',
              title: 'Animate',
              'title.ja': 'Animate',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            behance: {
              path: '/content/cq:tags/caas/mnemonics/behance',
              tagID: 'caas:mnemonics/behance',
              name: 'behance',
              tagImage: '',
              title: 'Behance',
              'title.ja': 'Behance',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            capture: {
              path: '/content/cq:tags/caas/mnemonics/capture',
              tagID: 'caas:mnemonics/capture',
              name: 'capture',
              tagImage: 'https://www.adobe.com/content/dam/shared/images/product-icons/svg/capture.svg',
              title: 'Capture',
              'title.ja': 'Capture',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'creative-cloud': {
              path: '/content/cq:tags/caas/mnemonics/creative-cloud',
              tagID: 'caas:mnemonics/creative-cloud',
              name: 'creative-cloud',
              tagImage: '',
              title: 'Creative Cloud',
              'title.ja': 'Creative Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-fonts': {
              path: '/content/cq:tags/caas/mnemonics/adobe-fonts',
              tagID: 'caas:mnemonics/adobe-fonts',
              name: 'adobe-fonts',
              tagImage: 'https://www.adobe.com/content/dam/shared/images/product-icons/svg/fonts.svg',
              title: 'Adobe Fonts',
              'title.ja': 'Adobe Fonts',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            illustrator: {
              path: '/content/cq:tags/caas/mnemonics/illustrator',
              tagID: 'caas:mnemonics/illustrator',
              name: 'illustrator',
              tagImage: 'https://www.adobe.com/content/dam/shared/images/product-icons/svg/illustrator.svg',
              title: 'Illustrator',
              'title.ja': 'Illustrator',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            lightroom: {
              path: '/content/cq:tags/caas/mnemonics/lightroom',
              tagID: 'caas:mnemonics/lightroom',
              name: 'lightroom',
              tagImage: '',
              title: 'Lightroom',
              'title.ja': 'Lightroom',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'lightroom-on-mobile': {
              path: '/content/cq:tags/caas/mnemonics/lightroom-on-mobile',
              tagID: 'caas:mnemonics/lightroom-on-mobile',
              name: 'lightroom-on-mobile',
              tagImage: '',
              title: 'Lightroom on mobile',
              'title.ja': 'モバイル版Lightroom',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'not-product-specific': {
              path: '/content/cq:tags/caas/mnemonics/not-product-specific',
              tagID: 'caas:mnemonics/not-product-specific',
              name: 'not-product-specific',
              tagImage: '',
              title: 'Not Product Specific',
              'title.ja': '特化製品なし',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            photoshop: {
              path: '/content/cq:tags/caas/mnemonics/photoshop',
              tagID: 'caas:mnemonics/photoshop',
              name: 'photoshop',
              tagImage: '',
              title: 'Photoshop',
              'title.ja': 'Photoshop',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            portfolio: {
              path: '/content/cq:tags/caas/mnemonics/portfolio',
              tagID: 'caas:mnemonics/portfolio',
              name: 'portfolio',
              tagImage: '',
              title: 'Portfolio',
              'title.ja': 'Portfolio',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'premiere-rush': {
              path: '/content/cq:tags/caas/mnemonics/premiere-rush',
              tagID: 'caas:mnemonics/premiere-rush',
              name: 'premiere-rush',
              tagImage: '',
              title: 'Premiere Rush',
              'title.ja': 'Premiere Rush',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-scan': {
              path: '/content/cq:tags/caas/mnemonics/adobe-scan',
              tagID: 'caas:mnemonics/adobe-scan',
              name: 'adobe-scan',
              tagImage: '',
              title: 'Adobe Scan',
              'title.ja': 'Adobe Scan',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-spark': {
              path: '/content/cq:tags/caas/mnemonics/adobe-spark',
              tagID: 'caas:mnemonics/adobe-spark',
              name: 'adobe-spark',
              tagImage: '',
              title: 'Adobe Spark',
              'title.ja': 'Adobe Spark',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-alchemist': {
              path: '/content/cq:tags/caas/mnemonics/substance-alchemist',
              tagID: 'caas:mnemonics/substance-alchemist',
              name: 'substance-alchemist',
              tagImage: '',
              title: 'Substance Alchemist',
              'title.ja': 'Substance Alchemist',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-source': {
              path: '/content/cq:tags/caas/mnemonics/substance-source',
              tagID: 'caas:mnemonics/substance-source',
              name: 'substance-source',
              tagImage: '',
              title: 'Substance Source',
              'title.ja': 'Substance Source',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'pdf-api': {
              path: '/content/cq:tags/caas/mnemonics/pdf-api',
              tagID: 'caas:mnemonics/pdf-api',
              name: 'pdf-api',
              tagImage: '',
              title: 'PDF API',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            preview: {
              path: '/content/cq:tags/caas/mnemonics/preview',
              tagID: 'caas:mnemonics/preview',
              name: 'preview',
              tagImage: '',
              title: 'Preview',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            substance: {
              path: '/content/cq:tags/caas/mnemonics/substance',
              tagID: 'caas:mnemonics/substance',
              name: 'substance',
              tagImage: '',
              title: 'Substance',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-advertising-cloud': {
              path: '/content/cq:tags/caas/mnemonics/adobe-advertising-cloud',
              tagID: 'caas:mnemonics/adobe-advertising-cloud',
              name: 'adobe-advertising-cloud',
              tagImage: '',
              title: 'Adobe Advertising Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-analytics': {
              path: '/content/cq:tags/caas/mnemonics/adobe-analytics',
              tagID: 'caas:mnemonics/adobe-analytics',
              name: 'adobe-analytics',
              tagImage: '',
              title: 'Adobe Analytics',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-audience-manager': {
              path: '/content/cq:tags/caas/mnemonics/adobe-audience-manager',
              tagID: 'caas:mnemonics/adobe-audience-manager',
              name: 'adobe-audience-manager',
              tagImage: '',
              title: 'Adobe Audience Manager',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-campaign': {
              path: '/content/cq:tags/caas/mnemonics/adobe-campaign',
              tagID: 'caas:mnemonics/adobe-campaign',
              name: 'adobe-campaign',
              tagImage: '',
              title: 'Adobe Campaign',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-commerce-cloud': {
              path: '/content/cq:tags/caas/mnemonics/adobe-commerce-cloud',
              tagID: 'caas:mnemonics/adobe-commerce-cloud',
              name: 'adobe-commerce-cloud',
              tagImage: '',
              title: 'Adobe Commerce Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-creative-cloud': {
              path: '/content/cq:tags/caas/mnemonics/adobe-creative-cloud',
              tagID: 'caas:mnemonics/adobe-creative-cloud',
              name: 'adobe-creative-cloud',
              tagImage: '',
              title: 'Adobe Creative Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-document-cloud': {
              path: '/content/cq:tags/caas/mnemonics/adobe-document-cloud',
              tagID: 'caas:mnemonics/adobe-document-cloud',
              name: 'adobe-document-cloud',
              tagImage: '',
              title: 'Adobe Document Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-experience-manager': {
              path: '/content/cq:tags/caas/mnemonics/adobe-experience-manager',
              tagID: 'caas:mnemonics/adobe-experience-manager',
              name: 'adobe-experience-manager',
              tagImage: '',
              title: 'Adobe Experience Manager',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-experience-cloud': {
              path: '/content/cq:tags/caas/mnemonics/adobe-experience-cloud',
              tagID: 'caas:mnemonics/adobe-experience-cloud',
              name: 'adobe-experience-cloud',
              tagImage: '',
              title: 'Adobe Experience Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-experience-platform': {
              path: '/content/cq:tags/caas/mnemonics/adobe-experience-platform',
              tagID: 'caas:mnemonics/adobe-experience-platform',
              name: 'adobe-experience-platform',
              tagImage: '',
              title: 'Adobe Experience Platform',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-primetime': {
              path: '/content/cq:tags/caas/mnemonics/adobe-primetime',
              tagID: 'caas:mnemonics/adobe-primetime',
              name: 'adobe-primetime',
              tagImage: '',
              title: 'Adobe Primetime',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-sensei': {
              path: '/content/cq:tags/caas/mnemonics/adobe-sensei',
              tagID: 'caas:mnemonics/adobe-sensei',
              name: 'adobe-sensei',
              tagImage: '',
              title: 'Adobe Sensei',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-target': {
              path: '/content/cq:tags/caas/mnemonics/adobe-target',
              tagID: 'caas:mnemonics/adobe-target',
              name: 'adobe-target',
              tagImage: '',
              title: 'Adobe Target',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'magento-business-intelligence': {
              path: '/content/cq:tags/caas/mnemonics/magento-business-intelligence',
              tagID: 'caas:mnemonics/magento-business-intelligence',
              name: 'magento-business-intelligence',
              tagImage: '',
              title: 'Magento Business Intelligence',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'magento-commerce': {
              path: '/content/cq:tags/caas/mnemonics/magento-commerce',
              tagID: 'caas:mnemonics/magento-commerce',
              name: 'magento-commerce',
              tagImage: '',
              title: 'Magento Commerce',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'magento-order-management': {
              path: '/content/cq:tags/caas/mnemonics/magento-order-management',
              tagID: 'caas:mnemonics/magento-order-management',
              name: 'magento-order-management',
              tagImage: '',
              title: 'Magento Order Management',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'marketo-engage-bizible': {
              path: '/content/cq:tags/caas/mnemonics/marketo-engage-bizible',
              tagID: 'caas:mnemonics/marketo-engage-bizible',
              name: 'marketo-engage-bizible',
              tagImage: '',
              title: 'Marketo Engage &amp; Marketo Measure',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            workfront: {
              path: '/content/cq:tags/caas/mnemonics/workfront',
              tagID: 'caas:mnemonics/workfront',
              name: 'workfront',
              tagImage: '',
              title: 'Adobe Workfront',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-commerce': {
              path: '/content/cq:tags/caas/mnemonics/adobe-commerce',
              tagID: 'caas:mnemonics/adobe-commerce',
              name: 'adobe-commerce',
              tagImage: '',
              title: 'Adobe Commerce',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'adobe-workfront': {
              path: '/content/cq:tags/caas/mnemonics/adobe-workfront',
              tagID: 'caas:mnemonics/adobe-workfront',
              name: 'adobe-workfront',
              tagImage: '',
              title: 'Adobe Workfront',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'creative-cloud-express': {
              path: '/content/cq:tags/caas/mnemonics/creative-cloud-express',
              tagID: 'caas:mnemonics/creative-cloud-express',
              name: 'creative-cloud-express',
              tagImage: '',
              title: 'Creative Cloud Express',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'creative-cloud-libraries': {
              path: '/content/cq:tags/caas/mnemonics/creative-cloud-libraries',
              tagID: 'caas:mnemonics/creative-cloud-libraries',
              name: 'creative-cloud-libraries',
              tagImage: '',
              title: 'Creative Cloud Libraries',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'premiere-express': {
              path: '/content/cq:tags/caas/mnemonics/premiere-express',
              tagID: 'caas:mnemonics/premiere-express',
              name: 'premiere-express',
              tagImage: '',
              title: 'Premiere Express',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-3d-assets': {
              path: '/content/cq:tags/caas/mnemonics/substance-3d-assets',
              tagID: 'caas:mnemonics/substance-3d-assets',
              name: 'substance-3d-assets',
              tagImage: '',
              title: 'Substance 3D Assets',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-3d-designer': {
              path: '/content/cq:tags/caas/mnemonics/substance-3d-designer',
              tagID: 'caas:mnemonics/substance-3d-designer',
              name: 'substance-3d-designer',
              tagImage: '',
              title: 'Substance 3D Designer',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-3d-modeler': {
              path: '/content/cq:tags/caas/mnemonics/substance-3d-modeler',
              tagID: 'caas:mnemonics/substance-3d-modeler',
              name: 'substance-3d-modeler',
              tagImage: '',
              title: 'Substance 3D Modeler',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-3d-painter': {
              path: '/content/cq:tags/caas/mnemonics/substance-3d-painter',
              tagID: 'caas:mnemonics/substance-3d-painter',
              name: 'substance-3d-painter',
              tagImage: '',
              title: 'Substance 3D Painter',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-3d-sampler': {
              path: '/content/cq:tags/caas/mnemonics/substance-3d-sampler',
              tagID: 'caas:mnemonics/substance-3d-sampler',
              name: 'substance-3d-sampler',
              tagImage: '',
              title: 'Substance 3D Sampler',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'substance-3d-stager': {
              path: '/content/cq:tags/caas/mnemonics/substance-3d-stager',
              tagID: 'caas:mnemonics/substance-3d-stager',
              name: 'substance-3d-stager',
              tagImage: '',
              title: 'Substance 3D Stager',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'photoshop-express': {
              path: '/content/cq:tags/caas/mnemonics/photoshop-express',
              tagID: 'caas:mnemonics/photoshop-express',
              name: 'photoshop-express',
              tagImage: '',
              title: 'Photoshop Express',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        audience: {
          path: '/content/cq:tags/caas/audience',
          tagID: 'caas:audience',
          name: 'audience',
          tagImage: '',
          title: 'Audience',
          description: '',
          'cq:movedTo': '',
          tags: {
            enterprise: {
              path: '/content/cq:tags/caas/audience/enterprise',
              tagID: 'caas:audience/enterprise',
              name: 'enterprise',
              tagImage: '',
              title: 'Enterprise',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            individual: {
              path: '/content/cq:tags/caas/audience/individual',
              tagID: 'caas:audience/individual',
              name: 'individual',
              tagImage: '',
              title: 'Individual',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            smb: {
              path: '/content/cq:tags/caas/audience/smb',
              tagID: 'caas:audience/smb',
              name: 'smb',
              tagImage: '',
              title: 'SMB',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'students-and-teachers': {
              path: '/content/cq:tags/caas/audience/students-and-teachers',
              tagID: 'caas:audience/students-and-teachers',
              name: 'students-and-teachers',
              tagImage: '',
              title: 'Students and Teachers',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        topic: {
          path: '/content/cq:tags/caas/topic',
          tagID: 'caas:topic',
          name: 'topic',
          tagImage: '',
          title: 'Topic',
          'title.zh_cn': '主题',
          'title.pt': 'Tópico',
          'title.fr': 'Sujet',
          'title.ja': 'トピック',
          'title.zh_tw': '主題',
          'title.it': 'Argomento',
          'title.ko': '주제',
          'title.de': 'Thema',
          'title.es': 'Tema',
          'title.hi': 'टॉपिक',
          'title.sv': 'Ämne',
          'title.nl': 'Onderwerp',
          'title.po': 'Tópico',
          'title.th': 'หัวข้อ',
          description: '',
          'cq:movedTo': '',
          tags: {
            agreements: {
              path: '/content/cq:tags/caas/topic/agreements',
              tagID: 'caas:topic/agreements',
              name: 'agreements',
              tagImage: '',
              title: 'Agreements',
              'title.zh_cn': '协议',
              'title.pt': 'Acordos',
              'title.fr': 'Accords',
              'title.ja': '合意',
              'title.zh_tw': '協議',
              'title.it': 'Accordi',
              'title.ko': '계약',
              'title.de': 'Vereinbarungen',
              'title.es': 'Acuerdos',
              'title.hi': 'एग्रीमेंट्स',
              'title.sv': 'Avtal',
              'title.nl': 'Overeenkomsten',
              'title.th': 'ข้อตกลง',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'work-from-anywhere': {
              path: '/content/cq:tags/caas/topic/work-from-anywhere',
              tagID: 'caas:topic/work-from-anywhere',
              name: 'work-from-anywhere',
              tagImage: '',
              title: 'Work from anywhere',
              'title.zh_cn': '随处工作',
              'title.pt': 'Trabalhar em qualquer lugar',
              'title.fr': 'Travail en tout lieu',
              'title.ja': 'どこでも作業',
              'title.zh_tw': '隨時隨地工作',
              'title.it': 'Lavora dove vuoi',
              'title.ko': '어디서나 작업',
              'title.de': 'Von jedem Ort aus arbeiten',
              'title.es': 'Trabaja desde cualquier lugar',
              'title.hi': 'कहीं से भी काम करें',
              'title.sv': 'Arbeta var du vill',
              'title.nl': 'Overal werken',
              'title.th': 'ทำงานได้จากทุกที่',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'electronic-signature': {
              path: '/content/cq:tags/caas/topic/electronic-signature',
              tagID: 'caas:topic/electronic-signature',
              name: 'electronic-signature',
              tagImage: '',
              title: 'Electronic signature',
              'title.zh_cn': '电子签名',
              'title.pt': 'Assinatura eletrônica',
              'title.fr': 'Signature électronique',
              'title.ja': '電子サイン',
              'title.zh_tw': '電子簽名',
              'title.it': 'Firma elettronica',
              'title.ko': '전자 서명',
              'title.de': 'Elektronische Signatur',
              'title.es': 'Firmas electrónicas',
              'title.hi': 'इलेक्ट्रॉनिक सिग्नेचर',
              'title.sv': 'Elektroniska signaturer',
              'title.nl': 'Elektronische handtekening',
              'title.th': 'ลายเซ็นอิเล็กทรอนิกส์',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'digital-signature': {
              path: '/content/cq:tags/caas/topic/digital-signature',
              tagID: 'caas:topic/digital-signature',
              name: 'digital-signature',
              tagImage: '',
              title: 'Digital signature',
              'title.zh_cn': '数字签名',
              'title.pt': 'Assinatura digital',
              'title.fr': 'Signature numérique',
              'title.ja': '電子署名',
              'title.zh_tw': '數位簽名',
              'title.it': 'Firma digitale',
              'title.ko': '디지털 서명',
              'title.de': 'Digitale Signatur',
              'title.es': 'Firma digital',
              'title.hi': 'डिजिटल सिग्नेचर',
              'title.sv': 'Digitala signaturer',
              'title.nl': 'Digitale handtekening',
              'title.th': 'ลายเซ็นดิจิทัล',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            contracts: {
              path: '/content/cq:tags/caas/topic/contracts',
              tagID: 'caas:topic/contracts',
              name: 'contracts',
              tagImage: '',
              title: 'Contracts',
              'title.zh_cn': '合同',
              'title.pt': 'Contratos',
              'title.fr': 'Contrats',
              'title.ja': '契約',
              'title.zh_tw': '合約',
              'title.it': 'Contratti',
              'title.ko': '계약서',
              'title.de': 'Verträge',
              'title.es': 'Contratos',
              'title.hi': 'कॉन्ट्रैक्ट्स',
              'title.sv': 'Kontrakt',
              'title.nl': 'Contracten',
              'title.th': 'สัญญา',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            invoices: {
              path: '/content/cq:tags/caas/topic/invoices',
              tagID: 'caas:topic/invoices',
              name: 'invoices',
              tagImage: '',
              title: 'Invoices',
              'title.zh_cn': '发票',
              'title.pt': 'Faturas',
              'title.fr': 'Factures',
              'title.ja': '請求書',
              'title.zh_tw': '發票',
              'title.it': 'Fatture',
              'title.ko': '송장',
              'title.de': 'Rechnungen',
              'title.es': 'Facturas',
              'title.hi': 'इनवॉयसेज़',
              'title.sv': 'Fakturor',
              'title.nl': 'Facturen',
              'title.th': 'ใบแจ้งหนี้',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'digital-transformation': {
              path: '/content/cq:tags/caas/topic/digital-transformation',
              tagID: 'caas:topic/digital-transformation',
              name: 'digital-transformation',
              tagImage: '',
              title: 'Digital Transformation',
              'title.zh_cn': '数字转型',
              'title.pt': 'Transformação digital',
              'title.fr': 'Transformation digitale',
              'title.ja': 'デジタル変革',
              'title.zh_tw': '數位化轉型',
              'title.it': 'Trasformazione digitale',
              'title.ko': '디지털 트랜스포메이션',
              'title.de': 'Digitale Transformation',
              'title.es': 'Transformación digital',
              'title.hi': 'डिजिटल ट्रांसफ़ॉर्मेशन',
              'title.sv': 'Digital omvandling',
              'title.nl': 'Digitale transformatie',
              'title.th': 'การเปลี่ยนแปลงทางดิจิทัล',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'campaign-management': {
              path: '/content/cq:tags/caas/topic/campaign-management',
              tagID: 'caas:topic/campaign-management',
              name: 'campaign-management',
              tagImage: '',
              title: 'Campaign Management',
              'title.zh_cn': '营销活动管理',
              'title.pt': 'Gerenciamento de campanha',
              'title.fr': 'Gestion de campagnes',
              'title.ja': 'キャンペーン管理',
              'title.zh_hk': '宣傳活動管理',
              'title.zh_tw': '行銷活動管理',
              'title.it': 'Gestione delle campagne',
              'title.ko': '캠페인 관리',
              'title.de': 'Kampagnen-Management',
              'title.es': 'Gestión de campañas',
              'title.hi': 'कैम्पेन मैनेजमेंट',
              'title.sv': 'Kampanjhantering',
              'title.nl': 'Campagnemanagement',
              'title.po': 'Gerenciamento de campanhas',
              'title.th': 'การจัดการแคมเปญ',
              description: 'DX Enterprise Campaign Management',
              'cq:movedTo': '',
              tags: {},
            },
            'artificial-intelligence': {
              path: '/content/cq:tags/caas/topic/artificial-intelligence',
              tagID: 'caas:topic/artificial-intelligence',
              name: 'artificial-intelligence',
              tagImage: '',
              title: 'Artificial Intelligence',
              'title.zh_cn': '人工智能',
              'title.pt': 'Inteligência artificial',
              'title.fr': 'Intelligence artificielle',
              'title.ja': 'AI（人工知能）',
              'title.zh_tw': '人工智慧',
              'title.it': 'Intelligenza artificiale',
              'title.ko': '인공 지능(AI)',
              'title.de': 'Künstliche Intelligenz',
              'title.es': 'Inteligencia artificial',
              'title.hi': 'आर्टिफ़‍िशियल इंटेलिजेंस',
              'title.sv': 'Artificiell intelligens',
              'title.nl': 'Kunstmatige intelligentie',
              'title.th': 'ปัญญาประดิษฐ์',
              description: 'DX Enterprise AI',
              'cq:movedTo': '',
              tags: {},
            },
            commerce: {
              path: '/content/cq:tags/caas/topic/commerce',
              tagID: 'caas:topic/commerce',
              name: 'commerce',
              tagImage: '',
              title: 'Commerce',
              'title.zh_cn': '商务',
              'title.pt': 'e-Commerce',
              'title.fr': 'Commerce',
              'title.ja': 'コマース',
              'title.zh_hk': '商務',
              'title.zh_tw': '商務',
              'title.it': 'E-commerce',
              'title.ko': '커머스',
              'title.de': 'Commerce',
              'title.es': 'Commerce',
              'title.hi': 'कॉमर्स',
              'title.sv': 'Handel',
              'title.nl': 'Commerce',
              'title.po': 'E-commerce',
              'title.th': 'การค้า',
              description: 'DX Enterprise and SMB Commerce',
              'cq:movedTo': '',
              tags: {},
            },
            trust: {
              path: '/content/cq:tags/caas/topic/trust',
              tagID: 'caas:topic/trust',
              name: 'trust',
              tagImage: '',
              title: 'Trust',
              'title.zh_cn': '信任',
              'title.pt': 'Confiança',
              'title.fr': 'Fiabilité',
              'title.ja': '信用',
              'title.zh_tw': '信任',
              'title.it': 'Fiducia',
              'title.ko': '신뢰',
              'title.de': 'Vertrauen',
              'title.es': 'Confianza',
              'title.hi': 'ट्रस्ट',
              'title.sv': 'Förtroende',
              'title.nl': 'Vertrouwen',
              'title.th': 'ความไว้วางใจ',
              description: 'DX Enterprise trust',
              'cq:movedTo': '',
              tags: {},
            },
            advertising: {
              path: '/content/cq:tags/caas/topic/advertising',
              tagID: 'caas:topic/advertising',
              name: 'advertising',
              tagImage: '',
              title: 'Advertising',
              'title.zh_cn': '广告',
              'title.pt': 'Publicidade',
              'title.fr': 'Publicité',
              'title.ja': '広告',
              'title.zh_tw': '廣告',
              'title.it': 'Pubblicità',
              'title.ko': '광고',
              'title.de': 'Advertising',
              'title.es': 'Publicidad',
              'title.hi': 'एडवर्टाइज़िंग',
              'title.sv': 'Annonsering',
              'title.nl': 'Reclame',
              'title.th': 'การโฆษณา',
              description: 'DX Enterprise Advertising',
              'cq:movedTo': '',
              tags: {},
            },
            analytics: {
              path: '/content/cq:tags/caas/topic/analytics',
              tagID: 'caas:topic/analytics',
              name: 'analytics',
              tagImage: '',
              title: 'Analytics',
              'title.zh_cn': '分析',
              'title.pt': 'Análises',
              'title.fr': 'Analytics',
              'title.ja': '分析',
              'title.zh_tw': '分析',
              'title.it': 'Analisi',
              'title.ko': '분석',
              'title.de': 'Analyse',
              'title.es': 'Análisis',
              'title.hi': 'एनालिटिक्स',
              'title.sv': 'Analys',
              'title.nl': 'Analytics',
              'title.th': 'การวิเคราะห์',
              description: 'DX Enterprise',
              'cq:movedTo': '',
              tags: {},
            },
            'content-management': {
              path: '/content/cq:tags/caas/topic/content-management',
              tagID: 'caas:topic/content-management',
              name: 'content-management',
              tagImage: '',
              title: 'Content Management',
              'title.zh_cn': '内容管理',
              'title.pt': 'Gerenciamento de conteúdo',
              'title.fr': 'Gestion de contenu',
              'title.ja': 'コンテンツ管理',
              'title.zh_hk': '內容管理',
              'title.zh_tw': '內容管理',
              'title.it': 'Gestione dei contenuti',
              'title.ko': '콘텐츠 관리',
              'title.de': 'Content-Management',
              'title.es': 'Gestión de contenido',
              'title.hi': 'कॉन्टेंट मैनेजमेंट',
              'title.sv': 'Innehållshantering',
              'title.nl': 'Contentmanagement',
              'title.po': 'Gerenciamento de conteúdo',
              'title.th': 'การจัดการเนื้อหา',
              description: 'DX Enterprise ',
              'cq:movedTo': '',
              tags: {},
            },
            'customer-intelligence': {
              path: '/content/cq:tags/caas/topic/customer-intelligence',
              tagID: 'caas:topic/customer-intelligence',
              name: 'customer-intelligence',
              tagImage: '',
              title: 'Customer Intelligence',
              'title.zh_cn': '客户智能',
              'title.pt': 'Inteligência do cliente',
              'title.fr': 'Intelligence client',
              'title.ja': 'カスタマーインテリジェンス',
              'title.zh_tw': '客戶智慧',
              'title.it': 'Customer intelligence',
              'title.ko': '고객 인텔리전스',
              'title.de': 'Customer Intelligence',
              'title.es': 'Inteligencia del cliente',
              'title.hi': 'कस्टमर इंटेलिजेंस',
              'title.sv': 'Kundanalys',
              'title.nl': 'Customer Intelligence',
              'title.th': 'ระบบข้อมูลลูกค้า',
              description: 'DX Enterprise ',
              'cq:movedTo': '',
              tags: {},
            },
            'data-management': {
              path: '/content/cq:tags/caas/topic/data-management',
              tagID: 'caas:topic/data-management',
              name: 'data-management',
              tagImage: '',
              title: 'Data Management',
              'title.zh_cn': '数据管理',
              'title.pt': 'Gerenciamento de dados',
              'title.fr': 'Gestion des données',
              'title.ja': 'データ管理',
              'title.zh_tw': '資料管理',
              'title.it': 'Gestione dei dati',
              'title.ko': '데이터 관리',
              'title.de': 'Daten-Management',
              'title.es': 'Gestión de datos',
              'title.hi': 'डेटा मैनेजमेंट',
              'title.sv': 'Datahantering',
              'title.nl': 'Datamanagement',
              'title.th': 'การจัดการข้อมูล',
              description: 'DX Enterprise ',
              'cq:movedTo': '',
              tags: {},
            },
            'digital-trends': {
              path: '/content/cq:tags/caas/topic/digital-trends',
              tagID: 'caas:topic/digital-trends',
              name: 'digital-trends',
              tagImage: '',
              title: 'Digital Trends',
              'title.zh_cn': '数字趋势',
              'title.pt': 'Digital Trends',
              'title.fr': 'Tendances digitales',
              'title.ja': 'デジタルトレンド',
              'title.zh_hk': '數位趨勢',
              'title.zh_tw': '數位趨勢',
              'title.it': 'Tendenze digitali',
              'title.ko': '디지털 트렌드',
              'title.de': 'Digitale Trends',
              'title.es': 'Tendencias digitales',
              'title.hi': 'डिजिटल ट्रेंड्ज़',
              'title.sv': 'Digitala trender',
              'title.nl': 'Digital Trends',
              'title.po': 'Tendências digitais',
              'title.th': 'เทรนด์ดิจิทัล',
              description: 'DX Enterprise ',
              'cq:movedTo': '',
              tags: {},
            },
            'marketing-automation': {
              path: '/content/cq:tags/caas/topic/marketing-automation',
              tagID: 'caas:topic/marketing-automation',
              name: 'marketing-automation',
              tagImage: '',
              title: 'Marketing Automation',
              'title.zh_cn': '营销自动化',
              'title.pt': 'Automação de marketing',
              'title.fr': 'Automatisation du marketing',
              'title.ja': 'MA（マーケティングオートメーション）',
              'title.zh_tw': '行銷自動化',
              'title.it': 'Automazione del marketing',
              'title.ko': '마케팅 자동화',
              'title.de': 'Marketing-Automatisierung',
              'title.es': 'Automatización del marketing',
              'title.hi': 'मार्केटिंग ऑटोमेशन',
              'title.sv': 'Automatiserad marknadsföring',
              'title.nl': 'Marketingautomatisering',
              'title.th': 'การตลาดแบบอัตโนมัติ',
              description: 'DX Enterprise ',
              'cq:movedTo': '',
              tags: {},
            },
            personalization: {
              path: '/content/cq:tags/caas/topic/personalization',
              tagID: 'caas:topic/personalization',
              name: 'personalization',
              tagImage: '',
              title: 'Personalization',
              'title.zh_cn': '个性化',
              'title.pt': 'Personalização',
              'title.fr': 'Personnalisation',
              'title.ja': 'パーソナライゼーション',
              'title.zh_hk': '個人化',
              'title.zh_tw': '個人化',
              'title.it': 'Personalizzazione',
              'title.ko': '개인화',
              'title.de': 'Personalisierung',
              'title.es': 'Personalización',
              'title.hi': 'पर्सनलाइज़ेशन',
              'title.sv': 'Personalisering',
              'title.nl': 'Personalisatie',
              'title.po': 'Personalização',
              'title.th': 'การปรับให้มีความเฉพาะตัว',
              description: 'DX Enterprise ',
              'cq:movedTo': '',
              tags: {},
            },
            'email-marketing': {
              path: '/content/cq:tags/caas/topic/email-marketing',
              tagID: 'caas:topic/email-marketing',
              name: 'email-marketing',
              tagImage: '',
              title: 'Email Marketing',
              'title.zh_cn': '电子邮件营销',
              'title.pt': 'Marketing por email',
              'title.fr': 'Marketing par e-mail',
              'title.ja': '電子メールマーケティング',
              'title.zh_tw': '電子郵件行銷',
              'title.it': 'E-mail marketing',
              'title.ko': '이메일 마케팅',
              'title.de': 'E-Mail-Marketing',
              'title.es': 'Marketing por correo electrónico',
              'title.hi': 'ईमेल मार्केटिंग',
              'title.sv': 'E-postmarknadsföring',
              'title.nl': 'E-mailmarketing',
              'title.th': 'การตลาดทางอีเมล',
              description: 'DX Enterprise ',
              'cq:movedTo': '',
              tags: {},
            },
            'digital-foundation': {
              path: '/content/cq:tags/caas/topic/digital-foundation',
              tagID: 'caas:topic/digital-foundation',
              name: 'digital-foundation',
              tagImage: '',
              title: 'Digital Foundation',
              'title.zh_cn': '数字基础',
              'title.pt': 'Base digital',
              'title.fr': 'Base digitale',
              'title.ja': 'デジタル基盤',
              'title.zh_tw': '數位基礎',
              'title.it': 'Base digitale',
              'title.ko': '디지털 기반',
              'title.de': 'Digitales Fundament',
              'title.es': 'Bases digitales',
              'title.hi': 'डिजिटल फ़ाउंडेशन',
              'title.sv': 'En digital grund',
              'title.nl': 'Digitaal fundament',
              'title.th': 'รากฐานทางดิจิทัล',
              description: 'DX Enterprise ',
              'cq:movedTo': '',
              tags: {},
            },
            'work-management': {
              path: '/content/cq:tags/caas/topic/work-management',
              tagID: 'caas:topic/work-management',
              name: 'work-management',
              tagImage: '',
              title: 'Work Management',
              'title.zh_cn': '工作管理',
              'title.pt': 'Gestão do trabalho',
              'title.fr': 'Gestion du travail',
              'title.ja': '作業管理',
              'title.zh_tw': '工作管理',
              'title.it': 'Gestione del lavoro',
              'title.ko': '작업 관리',
              'title.de': 'Work-Management',
              'title.es': 'Gestión del trabajo',
              'title.hi': 'वर्क मैनेजमेंट',
              'title.sv': 'Arbetsledning',
              'title.nl': 'Werkbeheer',
              'title.th': 'การจัดการงาน',
              description: 'DX Enterprise ',
              'cq:movedTo': '',
              tags: {},
            },
            'creative-leadership': {
              path: '/content/cq:tags/caas/topic/creative-leadership',
              tagID: 'caas:topic/creative-leadership',
              name: 'creative-leadership',
              tagImage: '',
              title: 'Creative leadership',
              'title.zh_cn': '创意领导力',
              'title.pt': 'Liderança criativa',
              'title.fr': 'Leadership dans le domaine de la création',
              'title.ja': 'クリエイティブリーダーシップ',
              'title.zh_tw': '創意領導力',
              'title.it': 'Leadership creativa',
              'title.ko': '크리에이티브 리더십',
              'title.de': 'Kreative Führung',
              'title.es': 'Liderazgo creativo',
              'title.hi': 'क्रिएटिव लीडरशिप',
              'title.sv': 'Kreativt ledarskap',
              'title.nl': 'Creatief leiderschap',
              'title.th': 'ความเป็นผู้นำเชิงสร้างสรรค์',
              description: 'CCT topic: Creative leadership',
              'cq:movedTo': '',
              tags: {},
            },
            collaboration: {
              path: '/content/cq:tags/caas/topic/collaboration',
              tagID: 'caas:topic/collaboration',
              name: 'collaboration',
              tagImage: '',
              title: 'Collaboration',
              'title.zh_cn': '协作',
              'title.pt': 'Colaboração',
              'title.fr': 'Collaboration',
              'title.ja': '共同作業',
              'title.zh_tw': '共同作業',
              'title.it': 'Collaborazione',
              'title.ko': '협업',
              'title.de': 'Zusammenarbeit',
              'title.es': 'Colaboración',
              'title.hi': 'कोलैबरेशन',
              'title.sv': 'Samarbete',
              'title.nl': 'Samenwerking',
              'title.th': 'การทำงานร่วมกัน',
              description: 'CCT topic:  Collaboration',
              'cq:movedTo': '',
              tags: {},
            },
            'process-and-scale': {
              path: '/content/cq:tags/caas/topic/process-and-scale',
              tagID: 'caas:topic/process-and-scale',
              name: 'process-and-scale',
              tagImage: '',
              title: 'Process and scale',
              'title.zh_cn': '处理和扩展',
              'title.pt': 'Processo e escala',
              'title.fr': 'Processus et échelle',
              'title.ja': 'プロセスと拡大',
              'title.zh_tw': '處理與擴展',
              'title.it': 'Processo e scalabilità',
              'title.ko': '처리 및 확장',
              'title.de': 'Verarbeiten und skalieren',
              'title.es': 'Procesar y escalar',
              'title.hi': 'प्रोसेस करें और स्केल करें',
              'title.sv': 'Bearbetning och skalning',
              'title.nl': 'Proces en schaal',
              'title.th': 'ดำเนินการและปรับขนาด',
              description: 'CCT topic:  Process and scale',
              'cq:movedTo': '',
              tags: {},
            },
            'business-impact': {
              path: '/content/cq:tags/caas/topic/business-impact',
              tagID: 'caas:topic/business-impact',
              name: 'business-impact',
              tagImage: '',
              title: 'Business impact',
              'title.zh_cn': '业务影响',
              'title.pt': 'Impacto comercial',
              'title.fr': 'Impact commercial',
              'title.ja': 'ビジネスへのインパクト',
              'title.zh_tw': '業務影響',
              'title.it': 'Impatto aziendale',
              'title.ko': '비즈니스 영향',
              'title.de': 'Geschäftliche Wirkung',
              'title.es': 'Impacto en el negocio',
              'title.hi': 'बिज़नेस इम्पैक्ट',
              'title.sv': 'Affärspåverkan',
              'title.nl': 'Zakelijke impact',
              'title.th': 'ผลลัพธ์ทางธุรกิจ',
              description: 'CCT topic: Business impact',
              'cq:movedTo': '',
              tags: {},
            },
            branding: {
              path: '/content/cq:tags/caas/topic/branding',
              tagID: 'caas:topic/branding',
              name: 'branding',
              tagImage: '',
              title: 'Branding',
              'title.zh_cn': '品牌化',
              'title.pt': 'Identidade visual',
              'title.fr': 'Branding',
              'title.ja': 'ブランディング',
              'title.zh_tw': '品牌',
              'title.it': 'Branding',
              'title.ko': '브랜딩',
              'title.de': 'Branding',
              'title.es': 'Construcción de marca',
              'title.hi': 'ब्रांडिंग',
              'title.sv': 'Varumärken',
              'title.nl': 'Branding',
              'title.th': 'การสร้างแบรนด์',
              description: 'CCT Topic: Branding',
              'cq:movedTo': '',
              tags: {},
            },
            'web-design': {
              path: '/content/cq:tags/caas/topic/web-design',
              tagID: 'caas:topic/web-design',
              name: 'web-design',
              tagImage: '',
              title: 'Web design',
              'title.zh_cn': 'Web 设计',
              'title.pt': 'Web design',
              'title.fr': 'Design web',
              'title.ja': 'webデザイン',
              'title.zh_tw': '網頁設計',
              'title.it': 'Web design',
              'title.ko': '웹 디자인',
              'title.de': 'Webdesign',
              'title.es': 'Diseño web',
              'title.hi': 'वेब डिज़ाइन',
              'title.sv': 'Webbdesign',
              'title.nl': 'Webdesign',
              'title.th': 'การออกแบบเว็บ',
              description: ' CCT topic: Web design',
              'cq:movedTo': '',
              tags: {},
            },
            'print-design': {
              path: '/content/cq:tags/caas/topic/print-design',
              tagID: 'caas:topic/print-design',
              name: 'print-design',
              tagImage: '',
              title: 'Print design',
              'title.zh_cn': '印刷设计',
              'title.pt': 'Design de impressão',
              'title.fr': 'Création de contenu pour l’impression',
              'title.ja': 'グラフィックデザイン',
              'title.zh_tw': '列印設計',
              'title.it': 'Progettazione per la stampa',
              'title.ko': '인쇄물 디자인',
              'title.de': 'Printdesign',
              'title.es': 'Diseño de impresión',
              'title.hi': 'प्रिंट डिज़ाइन',
              'title.sv': 'Tryckdesign',
              'title.nl': 'Ontwerp voor drukwerk',
              'title.th': 'การออกแบบการพิมพ์',
              description: 'CCT topic: Print design',
              'cq:movedTo': '',
              tags: {},
            },
            '3d-design': {
              path: '/content/cq:tags/caas/topic/3d-design',
              tagID: 'caas:topic/3d-design',
              name: '3d-design',
              tagImage: '',
              title: '3D design',
              'title.zh_cn': '3D 设计',
              'title.pt': 'Design 3D',
              'title.fr': 'Design 3D',
              'title.ja': '3Dデザイン',
              'title.zh_tw': '3D 設計',
              'title.it': 'Progettazione 3D',
              'title.ko': '3D 디자인',
              'title.de': '3D-Design',
              'title.es': 'Diseño en 3D',
              'title.hi': '3D डिज़ाइन',
              'title.sv': '3D-design',
              'title.nl': '3D-ontwerp',
              'title.po': 'Design 3D',
              'title.th': 'การออกแบบ 3 มิติ',
              description: 'CCT Topic: 3D design',
              'cq:movedTo': '',
              tags: {},
            },
            'video-production': {
              path: '/content/cq:tags/caas/topic/video-production',
              tagID: 'caas:topic/video-production',
              name: 'video-production',
              tagImage: '',
              title: 'Video production',
              'title.zh_cn': '视频制作',
              'title.pt': 'Produção de vídeos',
              'title.fr': 'Production vidéo',
              'title.ja': 'ビデオ制作',
              'title.zh_tw': '影片製作',
              'title.it': 'Produzione video',
              'title.ko': '영상 제작',
              'title.de': 'Videoproduktion',
              'title.es': 'Producción de vídeo',
              'title.hi': 'वीडियो प्रोडक्शन',
              'title.sv': 'Videoproduktion',
              'title.nl': 'Videoproductie',
              'title.th': 'การผลิตวิดีโอ',
              description: 'CCT Topic: Video production',
              'cq:movedTo': '',
              tags: {},
            },
            'marketing-strategy': {
              path: '/content/cq:tags/caas/topic/marketing-strategy',
              tagID: 'caas:topic/marketing-strategy',
              name: 'marketing-strategy',
              tagImage: '',
              title: 'Marketing strategy',
              'title.zh_cn': '营销策略',
              'title.pt': 'Estratégia de marketing',
              'title.fr': 'Stratégie marketing',
              'title.ja': 'マーケティング戦略',
              'title.zh_tw': '行銷策略',
              'title.it': 'Strategia di marketing',
              'title.ko': '마케팅 전략',
              'title.de': 'Marketing-Strategie',
              'title.es': 'Estrategia de marketing',
              'title.hi': 'मार्केटिंग स्ट्रैटजी',
              'title.sv': 'Marknadsföringsstrategi',
              'title.nl': 'Marketingstrategie',
              'title.th': 'กลยุทธ์การตลาด',
              description: 'CCT topic: Marketing strategy',
              'cq:movedTo': '',
              tags: {},
            },
            'admininstrative-management': {
              path: '/content/cq:tags/caas/topic/admininstrative-management',
              tagID: 'caas:topic/admininstrative-management',
              name: 'admininstrative-management',
              tagImage: '',
              title: 'Admininstrative management',
              'title.zh_cn': '行政管理',
              'title.pt': 'Gerenciamento administrativo',
              'title.fr': 'Gestion administrative',
              'title.ja': '経営管理',
              'title.zh_tw': '行政管理',
              'title.it': 'Gestione amministrativa',
              'title.ko': '경영 관리',
              'title.de': 'Verwaltung',
              'title.es': 'Gestión administrativa',
              'title.hi': 'एडमिनिस्ट्रेटिव मैनेजमेंट',
              'title.sv': 'Administrativ ledning',
              'title.nl': 'Administratief beheer',
              'title.th': 'การจัดการดูแลระบบ',
              description: 'CCT Topic: Admininstrative management',
              'cq:movedTo': '',
              tags: {},
            },
            'jpg-to-pdf': {
              path: '/content/cq:tags/caas/topic/jpg-to-pdf',
              tagID: 'caas:topic/jpg-to-pdf',
              name: 'jpg-to-pdf',
              tagImage: '',
              title: 'JPG to PDF',
              'title.zh_cn': 'JPG 转 PDF',
              'title.pt': 'JPG em PDF',
              'title.fr': 'JPG en PDF',
              'title.ja': 'JPGからPDFへの変換',
              'title.zh_tw': 'JPG 轉 PDF',
              'title.it': 'Da JPG a PDF',
              'title.ko': 'JPG를 PDF로',
              'title.de': 'JPEG in PDF',
              'title.es': 'De JPG a PDF',
              'title.hi': 'JPG से PDF',
              'title.sv': 'JPG till PDF',
              'title.nl': 'JPG naar PDF',
              'title.th': 'JPG เป็น PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'merge-pdf': {
              path: '/content/cq:tags/caas/topic/merge-pdf',
              tagID: 'caas:topic/merge-pdf',
              name: 'merge-pdf',
              tagImage: '',
              title: 'Merge PDF',
              'title.zh_cn': '合并 PDF',
              'title.pt': 'Mesclar PDFs',
              'title.fr': 'Fusionner des PDF',
              'title.ja': 'PDFの結合',
              'title.zh_tw': '合併 PDF',
              'title.it': 'Unire PDF',
              'title.ko': 'PDF 병합',
              'title.de': 'PDF-Datei zusammenführen',
              'title.es': 'Combinar archivos PDF',
              'title.hi': 'PDF को मर्ज करें',
              'title.sv': 'Sammanfoga PDF-filer',
              'title.nl': 'PDF samenvoegen',
              'title.th': 'รวม PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'compress-pdf': {
              path: '/content/cq:tags/caas/topic/compress-pdf',
              tagID: 'caas:topic/compress-pdf',
              name: 'compress-pdf',
              tagImage: '',
              title: 'Compress PDF',
              'title.zh_cn': '压缩 PDF',
              'title.pt': 'Compactar PDFs',
              'title.fr': 'Compresser un PDF',
              'title.ja': 'PDF圧縮',
              'title.zh_tw': '壓縮 PDF',
              'title.it': 'Comprimere PDF',
              'title.ko': 'PDF 압축',
              'title.de': 'PDF-Datei komprimieren',
              'title.es': 'Comprimir archivos PDF',
              'title.hi': 'PDF को कम्प्रेस करें',
              'title.sv': 'Komprimera PDF-filer',
              'title.nl': 'PDF comprimeren',
              'title.th': 'บีบอัด PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'edit-pdf': {
              path: '/content/cq:tags/caas/topic/edit-pdf',
              tagID: 'caas:topic/edit-pdf',
              name: 'edit-pdf',
              tagImage: '',
              title: 'Edit PDF',
              'title.zh_cn': '编辑 PDF',
              'title.pt': 'Editar PDFs',
              'title.fr': 'Modifier un PDF',
              'title.ja': 'PDFの編集',
              'title.zh_tw': '編輯 PDF',
              'title.it': 'Modificare PDF',
              'title.ko': 'PDF 편집',
              'title.de': 'PDF-Datei bearbeiten',
              'title.es': 'Editar PDF',
              'title.hi': 'PDF को एडिट करें',
              'title.sv': 'Redigera PDF-filer',
              'title.nl': 'PDF bewerken',
              'title.th': 'แก้ไข PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'word-to-pdf': {
              path: '/content/cq:tags/caas/topic/word-to-pdf',
              tagID: 'caas:topic/word-to-pdf',
              name: 'word-to-pdf',
              tagImage: '',
              title: 'Word to PDF',
              'title.zh_cn': 'Word 转 PDF',
              'title.pt': 'Word em PDF',
              'title.fr': 'Word en PDF',
              'title.ja': 'WordをPDFに変換',
              'title.zh_tw': 'Word 轉 PDF',
              'title.it': 'Da Word a PDF',
              'title.ko': 'Word를 PDF로',
              'title.de': 'Word in PDF',
              'title.es': 'De Word a PDF',
              'title.hi': 'Word से PDF',
              'title.sv': 'Word till PDF',
              'title.nl': 'Word naar PDF',
              'title.th': 'Word เป็น PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'pdf-to-word': {
              path: '/content/cq:tags/caas/topic/pdf-to-word',
              tagID: 'caas:topic/pdf-to-word',
              name: 'pdf-to-word',
              tagImage: '',
              title: 'PDF to Word',
              'title.zh_cn': 'PDF 转 Word',
              'title.pt': 'PDF em Word',
              'title.fr': 'PDF en Word',
              'title.ja': 'PDFをWordに変換',
              'title.zh_tw': 'PDF 轉 Word',
              'title.it': 'Da PDF a Word',
              'title.ko': 'PDF를 Word로',
              'title.de': 'PDF in Word',
              'title.es': 'De PDF a Word',
              'title.hi': 'PDF से Word',
              'title.sv': 'PDF till Word',
              'title.nl': 'PDF naar Word',
              'title.th': 'PDF เป็น Word',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'pdf-to-excel': {
              path: '/content/cq:tags/caas/topic/pdf-to-excel',
              tagID: 'caas:topic/pdf-to-excel',
              name: 'pdf-to-excel',
              tagImage: '',
              title: 'PDF to Excel',
              'title.zh_cn': 'PDF 转 Excel',
              'title.pt': 'PDF em Excel',
              'title.fr': 'PDF en Excel',
              'title.ja': 'PDFをExcelに変換',
              'title.zh_tw': 'PDF 轉 Excel',
              'title.it': 'Da PDF a Excel',
              'title.ko': 'PDF를 Excel로',
              'title.de': 'PDF in Excel',
              'title.es': 'PDF a Excel',
              'title.hi': 'PDF से Excel',
              'title.sv': 'PDF till Excel',
              'title.nl': 'PDF naar Excel',
              'title.th': 'PDF เป็น Excel',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'reorder-pdf-pages': {
              path: '/content/cq:tags/caas/topic/reorder-pdf-pages',
              tagID: 'caas:topic/reorder-pdf-pages',
              name: 'reorder-pdf-pages',
              tagImage: '',
              title: 'Reorder PDF pages',
              'title.zh_cn': '重新排序 PDF 页面',
              'title.pt': 'Reordenar páginas de PDFs',
              'title.fr': 'Réorganiser les pages d’un PDF',
              'title.ja': 'PDFページの並び替え',
              'title.zh_tw': '重新排序 PDF 頁面',
              'title.it': 'Riordinare le pagine di un PDF',
              'title.ko': 'PDF 페이지 재정렬',
              'title.de': 'PDF-Seiten neu sortieren',
              'title.es': 'Reordenar páginas de un PDF',
              'title.hi': 'PDF पेजेज़ को रीऑर्डर करें',
              'title.sv': 'Ordna om PDF-sidor',
              'title.nl': "PDF-pagina's herschikken",
              'title.th': 'จัดลำดับหน้า PDF ใหม่',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'request-signatures': {
              path: '/content/cq:tags/caas/topic/request-signatures',
              tagID: 'caas:topic/request-signatures',
              name: 'request-signatures',
              tagImage: '',
              title: 'Request signatures',
              'title.zh_cn': '请求签名',
              'title.pt': 'Solicitar assinaturas',
              'title.fr': 'Demander des signatures',
              'title.ja': 'サインの依頼',
              'title.zh_tw': '要求簽名',
              'title.it': 'Richiedere firme',
              'title.ko': '서명 요청',
              'title.de': 'Signaturen anfordern',
              'title.es': 'Solicitar firmas',
              'title.hi': 'सिग्नेचर्स के लिए रिक्वेस्ट करें',
              'title.sv': 'Begära signaturer',
              'title.nl': 'Handtekeningen aanvragen',
              'title.th': 'ขอลายเซ็น',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'add-pages-to-a-pdf': {
              path: '/content/cq:tags/caas/topic/add-pages-to-a-pdf',
              tagID: 'caas:topic/add-pages-to-a-pdf',
              name: 'add-pages-to-a-pdf',
              tagImage: '',
              title: 'Add pages to a PDF',
              'title.zh_cn': '将页面添加至 PDF',
              'title.pt': 'Adicionar páginas a um PDF',
              'title.fr': 'Ajouter des pages dans un PDF',
              'title.ja': 'ページをPDFに追加',
              'title.zh_tw': '為 PDF 新增頁面',
              'title.it': 'Aggiungere pagine a un PDF',
              'title.ko': 'PDF에 페이지 추가',
              'title.de': 'Seiten zu einer PDF-Datei hinzufügen',
              'title.es': 'Añadir páginas a un archivo PDF',
              'title.hi': 'PDF में पेजेज़ जोड़ें',
              'title.sv': 'Lägga till sidor i PDF-filer',
              'title.nl': "Pagina's toevoegen aan een PDF",
              'title.th': 'เพิ่มหน้าใน PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'extract-pdf-pages': {
              path: '/content/cq:tags/caas/topic/extract-pdf-pages',
              tagID: 'caas:topic/extract-pdf-pages',
              name: 'extract-pdf-pages',
              tagImage: '',
              title: 'Extract PDF pages',
              'title.zh_cn': '提取 PDF 页面',
              'title.pt': 'Extrair páginas de PDFs',
              'title.fr': 'Extraire des pages d’un PDF',
              'title.ja': 'PDFページの抽出',
              'title.zh_tw': '擷取 PDF 頁面',
              'title.it': 'Estrarre pagine da un PDF',
              'title.ko': 'PDF 페이지 추출',
              'title.de': 'PDF-Seiten extrahieren',
              'title.es': 'Extraer páginas de un PDF',
              'title.hi': 'PDF पेजेज़ को एक्सट्रैक्‍ट करें',
              'title.sv': 'Extrahera PDF-sidor',
              'title.nl': "PDF-pagina's extraheren",
              'title.th': 'แยกหน้า PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'convert-pdf': {
              path: '/content/cq:tags/caas/topic/convert-pdf',
              tagID: 'caas:topic/convert-pdf',
              name: 'convert-pdf',
              tagImage: '',
              title: 'Convert PDF',
              'title.zh_cn': '转化 PDF',
              'title.pt': 'Converter PDFs',
              'title.fr': 'Convertir un PDF',
              'title.ja': 'PDFに変換',
              'title.zh_tw': '轉換 PDF',
              'title.it': 'Convertire PDF',
              'title.ko': 'PDF 변환',
              'title.de': 'PDF-Datei konvertieren',
              'title.es': 'Convertir PDF',
              'title.hi': 'PDF को कन्‍वर्ट करें',
              'title.sv': 'Konvertera PDF-filer',
              'title.nl': 'PDF converteren',
              'title.th': 'แปลง PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'pdf-to-jpg': {
              path: '/content/cq:tags/caas/topic/pdf-to-jpg',
              tagID: 'caas:topic/pdf-to-jpg',
              name: 'pdf-to-jpg',
              tagImage: '',
              title: 'PDF to JPG',
              'title.zh_cn': 'PDF 转 JPG',
              'title.pt': 'PDF em JPG',
              'title.fr': 'PDF en JPG',
              'title.ja': 'PDFをJPGに変換',
              'title.zh_tw': 'PDF 轉 JPG',
              'title.it': 'Da PDF a JPG',
              'title.ko': 'PDF를 JPG로',
              'title.de': 'PDF in JPEG',
              'title.es': 'PDF a JPG',
              'title.hi': 'PDF से JPG',
              'title.sv': 'PDF till JPG',
              'title.nl': 'PDF naar JPG',
              'title.th': 'PDF เป็น JPG',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'fill-&-sign': {
              path: '/content/cq:tags/caas/topic/fill-&-sign',
              tagID: 'caas:topic/fill-&-sign',
              name: 'fill-&-sign',
              tagImage: '',
              title: 'Fill &amp; Sign',
              'title.zh_cn': '填写并签名',
              'title.pt': 'Preencher e assinar',
              'title.fr': 'Remplir et signer',
              'title.ja': '入力と署名',
              'title.zh_tw': '填寫並簽名',
              'title.it': 'Compila e firma',
              'title.ko': '채우기 및 서명',
              'title.de': 'Ausfüllen und unterschreiben',
              'title.es': 'Rellenar y firmar',
              'title.hi': 'फ़िल करें और साइन करें',
              'title.sv': 'Fylla i och signera',
              'title.nl': 'Invullen en ondertekenen',
              'title.th': 'กรอกและลงนาม',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'pdf-to-ppt': {
              path: '/content/cq:tags/caas/topic/pdf-to-ppt',
              tagID: 'caas:topic/pdf-to-ppt',
              name: 'pdf-to-ppt',
              tagImage: '',
              title: 'PDF to PPT',
              'title.zh_cn': 'PDF 转 PPT',
              'title.pt': 'PDF em PPT',
              'title.fr': 'PDF en PPT',
              'title.ja': 'PDFをPPTに変換',
              'title.zh_tw': 'PDF 轉 PPT',
              'title.it': 'Da PDF a PPT',
              'title.ko': 'PDF를 PPT로',
              'title.de': 'PDF in PPT',
              'title.es': 'PDF a PPT',
              'title.hi': 'PDF से PPT',
              'title.sv': 'PDF till PPT',
              'title.nl': 'PDF naar PPT',
              'title.th': 'PDF เป็น PPT',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'excel-to-pdf': {
              path: '/content/cq:tags/caas/topic/excel-to-pdf',
              tagID: 'caas:topic/excel-to-pdf',
              name: 'excel-to-pdf',
              tagImage: '',
              title: 'Excel to PDF',
              'title.zh_cn': 'Excel 转 PDF',
              'title.pt': 'Excel em PDF',
              'title.fr': 'Excel en PDF',
              'title.ja': 'ExcelをPFDに変換',
              'title.zh_tw': 'Excel 轉 PDF',
              'title.it': 'Da Excel a PDF',
              'title.ko': 'Excel을 PDF로',
              'title.de': 'Excel in PDF',
              'title.es': 'Excel a PDF',
              'title.hi': 'Excel से PDF',
              'title.sv': 'Excel till PDF',
              'title.nl': 'Excel naar PDF',
              'title.th': 'Excel เป็น PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'ppt-to-pdf': {
              path: '/content/cq:tags/caas/topic/ppt-to-pdf',
              tagID: 'caas:topic/ppt-to-pdf',
              name: 'ppt-to-pdf',
              tagImage: '',
              title: 'PPT to PDF',
              'title.zh_cn': 'PPT 转 PDF',
              'title.pt': 'PPT em PDF',
              'title.fr': 'PPT en PDF',
              'title.ja': 'PPTをPDFに変換',
              'title.zh_tw': 'PPT 轉 PDF',
              'title.it': 'Da PPT a PDF',
              'title.ko': 'PPT를 PDF로',
              'title.de': 'PPT in PDF',
              'title.es': 'De PPT a PDF',
              'title.hi': 'PPT से PDF',
              'title.sv': 'PPT till PDF',
              'title.nl': 'PPT naar PDF',
              'title.th': 'PPT เป็น PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'split-a-pdf': {
              path: '/content/cq:tags/caas/topic/split-a-pdf',
              tagID: 'caas:topic/split-a-pdf',
              name: 'split-a-pdf',
              tagImage: '',
              title: 'Split a PDF',
              'title.zh_cn': '拆分 PDF',
              'title.pt': 'Dividir um PDF',
              'title.fr': 'Fractionner un PDF',
              'title.ja': 'PDFの分割',
              'title.zh_tw': '拆分 PDF',
              'title.it': 'Suddividere un file PDF',
              'title.ko': 'PDF 분할',
              'title.de': 'PDF-Datei aufteilen',
              'title.es': 'Dividir un PDF',
              'title.hi': 'PDF को स्पिलिट',
              'title.sv': 'Dela PDF-filer',
              'title.nl': 'Een PDF splitsen',
              'title.th': 'แยก PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'delete-pdf-pages': {
              path: '/content/cq:tags/caas/topic/delete-pdf-pages',
              tagID: 'caas:topic/delete-pdf-pages',
              name: 'delete-pdf-pages',
              tagImage: '',
              title: 'Delete PDF pages',
              'title.zh_cn': '删除 PDF 页面',
              'title.pt': 'Excluir páginas de PDFs',
              'title.fr': 'Supprimer des pages d’un PDF',
              'title.ja': 'PDFページの削除',
              'title.zh_tw': '刪除 PDF 頁面',
              'title.it': 'Eliminare pagine da un PDF',
              'title.ko': 'PDF 페이지 삭제',
              'title.de': 'PDF-Seiten löschen',
              'title.es': 'Eliminar páginas de un PDF',
              'title.hi': 'PDF पेजेज़ को हटाएँ',
              'title.sv': 'Ta bort PDF-sidor',
              'title.nl': "PDF-pagina's verwijderen",
              'title.th': 'ลบหน้า PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'rotate-pdf-pages': {
              path: '/content/cq:tags/caas/topic/rotate-pdf-pages',
              tagID: 'caas:topic/rotate-pdf-pages',
              name: 'rotate-pdf-pages',
              tagImage: '',
              title: 'Rotate PDF pages',
              'title.zh_cn': '旋转 PDF 页面',
              'title.pt': 'Girar páginas de PDFs',
              'title.fr': 'Faire pivoter les pages d’un PDF',
              'title.ja': 'PDFページの回転',
              'title.zh_tw': '旋轉 PDF 頁面',
              'title.it': 'Ruotare le pagine di un PDF',
              'title.ko': 'PDF 페이지 회전',
              'title.de': 'PDF-Seiten drehen',
              'title.es': 'Rotar páginas de un PDF',
              'title.hi': 'PDF पेजेस को रोटेट करें',
              'title.sv': 'Rotera PDF-sidor',
              'title.nl': "PDF-pagina's roteren",
              'title.th': 'หมุนหน้า PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'password-protect-pdf': {
              path: '/content/cq:tags/caas/topic/password-protect-pdf',
              tagID: 'caas:topic/password-protect-pdf',
              name: 'password-protect-pdf',
              tagImage: '',
              title: 'Password protect PDF',
              'title.zh_cn': '密码保护 PDF',
              'title.pt': 'Proteger PDFs com senha',
              'title.fr': 'Protection d’un PDF par mot de passe',
              'title.ja': 'PDFをパスワードで保護',
              'title.zh_tw': '密碼保護 PDF',
              'title.it': 'Proteggere i PDF tramite password',
              'title.ko': '암호로 PDF 보호',
              'title.de': 'PDF-Datei mit einem Kennwort schützen',
              'title.es': 'Proteger PDF con contraseña',
              'title.hi': 'PDF को पासवर्ड से प्रोटेक्ट करें',
              'title.sv': 'Lösenordsskydda PDF-filer',
              'title.nl': 'PDF met wachtwoord beveiligen',
              'title.th': 'PDF แบบปกป้องรหัสผ่าน',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            integration: {
              path: '/content/cq:tags/caas/topic/integration',
              tagID: 'caas:topic/integration',
              name: 'integration',
              tagImage: '',
              title: 'Integration',
              'title.zh_cn': '整合',
              'title.pt': 'Integração',
              'title.fr': 'Intégration',
              'title.ja': '統合',
              'title.zh_tw': '整合',
              'title.it': 'Integrazione',
              'title.ko': '통합',
              'title.de': 'Integration',
              'title.es': 'Integración',
              'title.hi': 'इंटीग्रेशन',
              'title.sv': 'Integrering',
              'title.nl': 'Integratie',
              'title.th': 'การผสานการทำงาน',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'free-trial': {
              path: '/content/cq:tags/caas/topic/free-trial',
              tagID: 'caas:topic/free-trial',
              name: 'free-trial',
              tagImage: '',
              title: 'Free Trial',
              'title.zh_cn': '免费试用',
              'title.pt': 'Teste grátis',
              'title.fr': 'Essai gratuit',
              'title.ja': '無償体験',
              'title.zh_tw': '免費試用',
              'title.it': 'Prova gratuita',
              'title.ko': '무료 체험판',
              'title.de': 'Kostenloser Test',
              'title.es': 'Probar gratis',
              'title.hi': 'फ़्री ट्रायल',
              'title.sv': 'Prova utan kostnad',
              'title.nl': 'Gratis proefversie',
              'title.th': 'ทดลองใช้ฟรี',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            frictionless: {
              path: '/content/cq:tags/caas/topic/frictionless',
              tagID: 'caas:topic/frictionless',
              name: 'frictionless',
              tagImage: '',
              title: 'Frictionless',
              'title.zh_cn': '无摩擦',
              'title.pt': 'Sem atrito',
              'title.fr': 'Fluidité',
              'title.ja': 'スムーズな体験',
              'title.zh_tw': '無摩擦',
              'title.it': 'Frictionless',
              'title.ko': '유연성',
              'title.de': 'Reibungslos',
              'title.es': 'Sin puntos de fricción',
              'title.hi': 'फ़‍िक्‍शनलेस',
              'title.sv': 'Friktionsfritt',
              'title.nl': 'Probleemloos',
              'title.th': 'ราบรื่น',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            compare: {
              path: '/content/cq:tags/caas/topic/compare',
              tagID: 'caas:topic/compare',
              name: 'compare',
              tagImage: '',
              title: 'Compare',
              'title.zh_cn': '对比',
              'title.pt': 'Comparação',
              'title.fr': 'Comparatif',
              'title.ja': '比較',
              'title.zh_tw': '比較',
              'title.it': 'Confronto',
              'title.ko': '비교',
              'title.de': 'Vergleichen',
              'title.es': 'Comparación',
              'title.hi': 'कंपेयर करें',
              'title.sv': 'Jämför',
              'title.nl': 'Vergelijken',
              'title.th': 'เปรียบเทียบ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'crop-pdf': {
              path: '/content/cq:tags/caas/topic/crop-pdf',
              tagID: 'caas:topic/crop-pdf',
              name: 'crop-pdf',
              tagImage: '',
              title: 'Crop PDF',
              'title.zh_cn': '裁剪 PDF',
              'title.pt': 'Recortar PDFs',
              'title.fr': 'Recadrer un PDF',
              'title.ja': 'PDFの切り抜き',
              'title.zh_tw': '裁切 PDF',
              'title.it': 'Ritagliare PDF',
              'title.ko': 'PDF 자르기',
              'title.de': 'PDF-Datei zuschneiden',
              'title.es': 'Recortar un archivo PDF',
              'title.hi': 'PDF को क्रॉप करें',
              'title.sv': 'Beskära PDF-filer',
              'title.nl': 'PDF bijsnijden',
              'title.th': 'ครอบตัด PDF',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'rearrange-pdf': {
              path: '/content/cq:tags/caas/topic/rearrange-pdf',
              tagID: 'caas:topic/rearrange-pdf',
              name: 'rearrange-pdf',
              tagImage: '',
              title: 'Rearrange PDF',
              'title.zh_cn': '重新排列 PDF',
              'title.pt': 'Reorganizar PDFs',
              'title.fr': 'Réorganiser un PDF',
              'title.ja': 'PDFの再整理',
              'title.zh_tw': '重新排列 PDF',
              'title.it': 'Ridisporre i PDF',
              'title.ko': 'PDF 재정렬',
              'title.de': 'PDF-Datei neu anordnen',
              'title.es': 'Reorganizar PDF',
              'title.hi': 'PDF को रीअरेंज करें',
              'title.sv': 'Ordna om PDF-filer',
              'title.nl': 'PDF rangschikken',
              'title.th': 'จัดเรียง PDF ใหม่',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'campaign-orchestration': {
              path: '/content/cq:tags/caas/topic/campaign-orchestration',
              tagID: 'caas:topic/campaign-orchestration',
              name: 'campaign-orchestration',
              tagImage: '',
              title: 'Campaign Orchestration',
              'title.zh_cn': '营销活动编排',
              'title.pt': 'Orquestração de campanhas',
              'title.fr': 'Orchestration de campagnes',
              'title.ja': 'キャンペーン編成',
              'title.zh_tw': '行銷活動編排',
              'title.it': 'Orchestrazione delle campagne',
              'title.ko': '캠페인 통합 관리',
              'title.de': 'Kampagnen-Orchestrierung',
              'title.es': 'Organización de campañas',
              'title.hi': 'कैम्पेन ऑरकेस्ट्रेशन',
              'title.sv': 'Kampanjsamordning',
              'title.nl': 'Campagneorkestratie',
              'title.th': 'การบริหารแคมเปญ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'data-management-platform': {
              path: '/content/cq:tags/caas/topic/data-management-platform',
              tagID: 'caas:topic/data-management-platform',
              name: 'data-management-platform',
              tagImage: '',
              title: 'Data Management Platform',
              'title.zh_cn': '数据管理平台',
              'title.pt': 'Plataforma de gerenciamento de dados',
              'title.fr': 'Plateforme de gestion des données',
              'title.ja': 'DMP（データ管理プラットフォーム）',
              'title.zh_tw': '資料管理平台',
              'title.it': 'Piattaforma di gestione dati',
              'title.ko': '데이터 관리 플랫폼',
              'title.de': 'Daten-Management-Plattform',
              'title.es': 'Plataforma de gestión de datos',
              'title.hi': 'डेटा मैनेजमेंट प्लैटफ़ॉर्म',
              'title.sv': 'Plattform för datahantering',
              'title.nl': 'Data Management Platform',
              'title.th': 'แพลตฟอร์มการจัดการข้อมูล',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'creativity-design': {
              path: '/content/cq:tags/caas/topic/creativity-design',
              tagID: 'caas:topic/creativity-design',
              name: 'creativity-design',
              tagImage: '',
              title: 'Creativity Design',
              'title.zh_cn': '创意设计',
              'title.pt': 'Design de criatividade',
              'title.fr': 'Créativité et design',
              'title.ja': 'クリエイティブデザイン',
              'title.zh_tw': '創意設計',
              'title.it': 'Creatività e design',
              'title.ko': '크리에이티브 디자인',
              'title.de': 'Kreativität und Design',
              'title.es': 'Diseño creativo',
              'title.hi': 'क्रिएटिविटी डिज़ाइन',
              'title.sv': 'Kreativ design',
              'title.nl': 'Creativiteit en ontwerp',
              'title.th': 'การออกแบบเชิงสร้างสรรค์',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'document-management': {
              path: '/content/cq:tags/caas/topic/document-management',
              tagID: 'caas:topic/document-management',
              name: 'document-management',
              tagImage: '',
              title: 'Document Management',
              'title.zh_cn': '文档管理',
              'title.pt': 'Gerenciamento de documentos',
              'title.fr': 'Gestion documentaire',
              'title.ja': '文書管理',
              'title.zh_tw': '文件管理',
              'title.it': 'Gestione dei documenti',
              'title.ko': '문서 관리',
              'title.de': 'Dokumenten-Management',
              'title.es': 'Gestión de documentos',
              'title.hi': 'डॉक्युमेंट मैनेजमेंट',
              'title.sv': 'Dokumenthantering',
              'title.nl': 'Documentbeheer',
              'title.th': 'การจัดการเอกสาร',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'tech-for-good': {
              path: '/content/cq:tags/caas/topic/tech-for-good',
              tagID: 'caas:topic/tech-for-good',
              name: 'tech-for-good',
              tagImage: '',
              title: 'Tech for Good',
              'title.zh_cn': '科技向善',
              'title.pt': 'Tecnologia para o bem',
              'title.fr': 'La technologie au service du bien commun',
              'title.ja': 'テックフォーグッド（Tech for Good）',
              'title.zh_tw': '科技造福',
              'title.it': 'Tech for Good',
              'title.ko': '공익을 위한 기술',
              'title.de': 'Tech for Good',
              'title.es': 'Tech for good',
              'title.hi': 'भलाई के लिए टेक्नोलॉजी',
              'title.sv': 'Teknologi till nytta',
              'title.nl': 'Tech for Good',
              'title.th': 'เทคโนโลยีสำหรับสิ่งดีๆ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'demand-marketing': {
              path: '/content/cq:tags/caas/topic/demand-marketing',
              tagID: 'caas:topic/demand-marketing',
              name: 'demand-marketing',
              tagImage: '',
              title: 'Demand Marketing',
              'title.zh_cn': '需求营销',
              'title.pt': 'Marketing de demanda',
              'title.fr': 'Marketing de la demande',
              'title.ja': 'デマンドマーケティング',
              'title.zh_tw': '需求行銷',
              'title.it': 'Demand marketing',
              'title.ko': '수요 중심 마케팅',
              'title.de': 'Demand-Marketing',
              'title.es': 'Marketing de demanda',
              'title.hi': 'डिमांड मार्केटिंग',
              'title.sv': 'Skapa efterfrågan',
              'title.nl': 'Demand marketing',
              'title.th': 'การตลาดแบบอุปสงค์',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'enterprise-work-management': {
              path: '/content/cq:tags/caas/topic/enterprise-work-management',
              tagID: 'caas:topic/enterprise-work-management',
              name: 'enterprise-work-management',
              tagImage: '',
              title: 'Enterprise Work Management',
              'title.zh_cn': '企业工作管理',
              'title.pt': 'Gestão de trabalho corporativo',
              'title.fr': 'Gestion du travail en entreprise',
              'title.ja': 'エンタープライズタスク管理',
              'title.zh_tw': '企業工作管理',
              'title.it': 'Gestione del lavoro aziendale',
              'title.ko': '엔터프라이즈 작업 관리',
              'title.de': 'Enterprise Work Management',
              'title.es': 'Gestión del trabajo de la empresa',
              'title.hi': 'एंटरप्राइज़ वर्क मैनेजमेंट',
              'title.sv': 'Arbetsledning i enterpriseklass',
              'title.nl': 'Enterprise Work Management',
              'title.th': 'การจัดการงานขององค์กร',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'digital-asset-management': {
              path: '/content/cq:tags/caas/topic/digital-asset-management',
              tagID: 'caas:topic/digital-asset-management',
              name: 'digital-asset-management',
              tagImage: '',
              title: 'Digital Asset Management',
              'title.zh_cn': '数字资产管理',
              'title.pt': 'Gerenciamento de ativos digitais',
              'title.fr': 'Gestion des assets digitaux',
              'title.ja': 'DAM（デジタルアセット管理）',
              'title.zh_tw': '數位資產管理',
              'title.it': 'Gestione delle risorse digitali',
              'title.ko': '디지털 에셋 관리',
              'title.de': 'Digital Asset Management',
              'title.es': 'Gestión de activos digitales',
              'title.hi': 'डिजिटल एसेट मैनेजमेंट',
              'title.sv': 'Hantering av digitala resurser (DAM)',
              'title.nl': 'Digital Asset Management',
              'title.th': 'การจัดการดิจิทัลแอสเซท',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'b2b-marketing': {
              path: '/content/cq:tags/caas/topic/b2b-marketing',
              tagID: 'caas:topic/b2b-marketing',
              name: 'b2b-marketing',
              tagImage: '',
              title: 'B2b Marketing',
              'title.zh_cn': 'B2B 营销',
              'title.pt': 'Marketing B2B',
              'title.fr': 'Marketing B2B',
              'title.ja': 'B2Bマーケティング',
              'title.zh_tw': 'B2b 行銷',
              'title.it': 'Marketing B2b',
              'title.ko': 'B2B 마케팅',
              'title.de': 'B2B-Marketing',
              'title.es': 'Marketing B2b',
              'title.hi': 'B2b मार्केटिंग',
              'title.sv': 'B2B-marknadsföring',
              'title.nl': 'B2B-marketing',
              'title.th': 'การตลาดแบบ B2B',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'customer-journey-management': {
              path: '/content/cq:tags/caas/topic/customer-journey-management',
              tagID: 'caas:topic/customer-journey-management',
              name: 'customer-journey-management',
              tagImage: '',
              title: 'Customer Journey Management',
              'title.zh_cn': '客户旅程管理',
              'title.pt': 'Gerenciamento da jornada do cliente',
              'title.fr': 'Gestion du parcours client',
              'title.ja': 'カスタマージャーニー管理',
              'title.zh_tw': '客戶歷程管理',
              'title.it': 'Gestione del customer journey',
              'title.ko': '고객 여정 관리',
              'title.de': 'Customer Journey Management',
              'title.es': 'Gestión del recorrido del cliente',
              'title.hi': 'कस्टमर्स जर्नी मैनेजमेंट',
              'title.sv': 'Hantering av kundresor',
              'title.nl': 'Klanttrajectbeheer',
              'title.th': 'การจัดการเส้นทางการซื้อของลูกค้า',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'data-&-insights': {
              path: '/content/cq:tags/caas/topic/data-&-insights',
              tagID: 'caas:topic/data-&-insights',
              name: 'data-&-insights',
              tagImage: '',
              title: 'Data &amp; Insights',
              'title.zh_cn': '数据和洞察',
              'title.pt': 'Dados e insights',
              'title.fr': 'Données et insights',
              'title.ja': 'データ／インサイト',
              'title.zh_tw': '資料與洞察',
              'title.it': 'Dati e approfondimenti',
              'title.ko': '데이터 및 인사이트',
              'title.de': 'Daten und Erkenntnisse',
              'title.es': 'Datos e información',
              'title.hi': 'डेटा एवं इनसाइट्स',
              'title.sv': 'Data och insikter',
              'title.nl': 'Data en inzichten',
              'title.th': 'ข้อมูลและข้อมูลเชิงลึก',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'digital-economy': {
              path: '/content/cq:tags/caas/topic/digital-economy',
              tagID: 'caas:topic/digital-economy',
              name: 'digital-economy',
              tagImage: '',
              title: 'Digital Economy',
              'title.zh_cn': '数字经济',
              'title.pt': 'Economia digital',
              'title.fr': 'Économie digitale',
              'title.ja': 'デジタルエコノミー',
              'title.zh_tw': '數位經濟',
              'title.it': 'Economia digitale',
              'title.ko': '디지털 경제',
              'title.de': 'Digitale Wirtschaft',
              'title.es': 'Economía digital',
              'title.hi': 'डिजिटल इकॉनमी',
              'title.sv': 'Den digitala marknaden',
              'title.nl': 'Digital Economy',
              'title.th': 'เศรษฐกิจดิจิทัล',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'customer-data-platform': {
              path: '/content/cq:tags/caas/topic/customer-data-platform',
              tagID: 'caas:topic/customer-data-platform',
              name: 'customer-data-platform',
              tagImage: '',
              title: 'Customer Data Platform',
              'title.zh_cn': '客户数据平台',
              'title.pt': 'Plataforma de dados de clientes',
              'title.fr': 'Plateforme de données client',
              'title.ja': 'CDP（顧客データプラットフォーム）',
              'title.zh_tw': '客戶資料平台',
              'title.it': 'Piattaforma di gestione dei dati dei clienti',
              'title.ko': '고객 데이터 플랫폼',
              'title.de': 'Kundendatenplattform',
              'title.es': 'Plataforma de datos de clientes',
              'title.hi': 'कस्टमर डेटा प्लेटफ़ॉर्म',
              'title.sv': 'Kunddataplattform',
              'title.nl': 'Customer Data Platform',
              'title.th': 'แพลตฟอร์มข้อมูลลูกค้า',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'experience-manager': {
              path: '/content/cq:tags/caas/topic/experience-manager',
              tagID: 'caas:topic/experience-manager',
              name: 'experience-manager',
              tagImage: '',
              title: 'Experience Manager',
              'title.zh_cn': 'Experience Manager',
              'title.pt': 'Experience Manager',
              'title.fr': 'Adobe Experience Manager',
              'title.ja': 'Adobe Experience Manager',
              'title.zh_tw': 'Experience Manager',
              'title.it': 'Experience Manager',
              'title.ko': 'Experience Manager',
              'title.de': 'Experience Manager',
              'title.es': 'Experience Manager',
              'title.hi': 'Experience Manager',
              'title.sv': 'Experience Manager',
              'title.nl': 'Experience Manager',
              'title.th': 'Experience Manager',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'business-continuity': {
              path: '/content/cq:tags/caas/topic/business-continuity',
              tagID: 'caas:topic/business-continuity',
              name: 'business-continuity',
              tagImage: '',
              title: 'Business Continuity',
              'title.zh_cn': '业务连续性',
              'title.pt': 'Continuidade dos negócios',
              'title.fr': 'Continuité opérationnelle',
              'title.ja': 'ビジネスの継続性',
              'title.zh_tw': '業務連續性',
              'title.it': 'Continuità operativa',
              'title.ko': '비즈니스 연속성',
              'title.de': 'Business Continuity',
              'title.es': 'Continuidad empresarial',
              'title.hi': 'बिज़नेस कॉन्टिनुइटी',
              'title.sv': 'Affärskontinuitet',
              'title.nl': 'Bedrijfscontinuïteit',
              'title.th': 'ความต่อเนื่องทางธุรกิจ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'data-foundation': {
              path: '/content/cq:tags/caas/topic/data-foundation',
              tagID: 'caas:topic/data-foundation',
              name: 'data-foundation',
              tagImage: '',
              title: 'Data Foundation',
              'title.zh_cn': '数据基础',
              'title.pt': 'Base de dados',
              'title.fr': 'Socle de données',
              'title.ja': 'データ基盤',
              'title.zh_tw': '資料基礎',
              'title.it': 'Base dati',
              'title.ko': '데이터 기반',
              'title.de': 'Datenfundament',
              'title.es': 'Base de datos',
              'title.hi': 'डेटा फ़ाउंडेशन',
              'title.sv': 'En grund i data',
              'title.nl': 'Datafundament',
              'title.th': 'รากฐานข้อมูล',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            cookieless: {
              path: '/content/cq:tags/caas/topic/cookieless',
              tagID: 'caas:topic/cookieless',
              name: 'cookieless',
              tagImage: '',
              title: 'Cookieless',
              'title.zh_cn': '无 Cookie',
              'title.pt': 'Sem cookies',
              'title.fr': 'Sans cookies',
              'title.ja': 'Cookieレス',
              'title.zh_tw': '無 Cookie',
              'title.it': 'Senza cookie',
              'title.ko': '쿠키리스',
              'title.de': 'Cookie-frei',
              'title.es': 'Sin cookies',
              'title.hi': 'कुकीलेस',
              'title.sv': 'Cookiefritt',
              'title.nl': 'Cookieloos',
              'title.th': 'คุกกี้เลส',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            digital: {
              path: '/content/cq:tags/caas/topic/digital',
              tagID: 'caas:topic/digital',
              name: 'digital',
              tagImage: '',
              title: 'Digital',
              'title.zh_cn': '数字',
              'title.pt': 'Digital',
              'title.fr': 'Digital',
              'title.ja': 'デジタル',
              'title.zh_tw': '數位',
              'title.it': 'Digitale',
              'title.ko': '디지털',
              'title.de': 'Digital',
              'title.es': 'Digital',
              'title.hi': 'डिजिटल',
              'title.sv': 'Digitalt',
              'title.nl': 'Digitaal',
              'title.th': 'ดิจิทัล',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'digital-workflows-and-enrollment': {
              path: '/content/cq:tags/caas/topic/digital-workflows-and-enrollment',
              tagID: 'caas:topic/digital-workflows-and-enrollment',
              name: 'digital-workflows-and-enrollment',
              tagImage: '',
              title: 'Digital Workflows and Enrollment',
              'title.zh_cn': '数字工作流程和注册',
              'title.pt': 'Fluxos de trabalho e inscrição digitais',
              'title.fr': 'Workflows digitaux et adhésion',
              'title.ja': 'デジタルワークフローと登録',
              'title.zh_tw': '數位工作流程與註冊',
              'title.it': 'Flussi di lavoro digitali e iscrizione',
              'title.ko': '디지털 워크플로우 및 등록',
              'title.de': 'Digitale Workflows und Registrierung',
              'title.es': 'Flujos de trabajo e inscripciones digitales',
              'title.hi': 'डिजिटल वर्कफ़्लोज़ और एनरोलमेंट',
              'title.sv': 'Digitala arbetsflöden och registreringar',
              'title.nl': 'Digitale workflows en aanmelding',
              'title.th': 'เวิร์กโฟลว์และการลงทะเบียนทางดิจิทัล',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'experience-masters-series': {
              path: '/content/cq:tags/caas/topic/experience-masters-series',
              tagID: 'caas:topic/experience-masters-series',
              name: 'experience-masters-series',
              tagImage: '',
              title: 'Experience Masters Series',
              'title.zh_cn': '体验大师系列',
              'title.pt': 'Série Experience Masters',
              'title.fr': 'Série Experience Masters',
              'title.ja': 'Adobe Experience Masters Series',
              'title.zh_tw': 'Experience Masters 系列',
              'title.it': 'Serie Experience Masters',
              'title.ko': '경험 마스터 시리즈',
              'title.de': 'Adobe Experience Masters',
              'title.es': 'Experience Masters Series',
              'title.hi': 'Experience Masters Series',
              'title.sv': 'Experience Masters Series',
              'title.nl': 'Experience Masters Series',
              'title.th': 'Experience Masters Series',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            privacy: {
              path: '/content/cq:tags/caas/topic/privacy',
              tagID: 'caas:topic/privacy',
              name: 'privacy',
              tagImage: '',
              title: 'Privacy',
              'title.zh_cn': '隐私',
              'title.pt': 'Privacidade',
              'title.fr': 'Confidentialité',
              'title.ja': 'プライバシー',
              'title.zh_tw': '隱私權',
              'title.it': 'Privacy',
              'title.ko': '개인정보 처리',
              'title.de': 'Datenschutz',
              'title.es': 'Privacidad',
              'title.hi': 'प्राइवेसी',
              'title.sv': 'Integritet',
              'title.nl': 'Privacy',
              'title.th': 'ความเป็นส่วนตัว',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            security: {
              path: '/content/cq:tags/caas/topic/security',
              tagID: 'caas:topic/security',
              name: 'security',
              tagImage: '',
              title: 'Security',
              'title.zh_cn': '安全性',
              'title.pt': 'Segurança',
              'title.fr': 'Sécurité',
              'title.ja': 'セキュリティ',
              'title.zh_tw': '安全性',
              'title.it': 'Sicurezza',
              'title.ko': '보안',
              'title.de': 'Sicherheit',
              'title.es': 'Seguridad',
              'title.hi': 'सिक्योरिटी',
              'title.sv': 'Säkerhet',
              'title.nl': 'Beveiliging',
              'title.th': 'ความปลอดภัย',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            stock: {
              path: '/content/cq:tags/caas/topic/stock',
              tagID: 'caas:topic/stock',
              name: 'stock',
              tagImage: '',
              title: 'Stock',
              'title.zh_cn': 'Adobe Stock',
              'title.pt': 'Banco de imagens',
              'title.fr': 'Adobe Stock',
              'title.ja': 'Adobe Stock',
              'title.zh_tw': 'Adobe Stock',
              'title.it': 'Stock',
              'title.ko': '스톡',
              'title.de': 'Adobe Stock',
              'title.es': 'Stock',
              'title.hi': 'Adobe Stock',
              'title.sv': 'Adobe Stock',
              'title.nl': 'Stock',
              'title.th': 'Adobe Stock',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'generative-ai': {
              path: '/content/cq:tags/caas/topic/generative-ai',
              tagID: 'caas:topic/generative-ai',
              name: 'generative-ai',
              tagImage: '',
              title: 'Generative AI ',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            '3d-ar': {
              path: '/content/cq:tags/caas/topic/3d-ar',
              tagID: 'caas:topic/3d-ar',
              name: '3d-ar',
              tagImage: '',
              title: '3D &amp; AR',
              description: '',
              'cq:movedTo': '',
              tags: {
                '3d-design': {
                  path: '/content/cq:tags/caas/topic/3d-ar/3d-design',
                  tagID: 'caas:topic/3d-ar/3d-design',
                  name: '3d-design',
                  tagImage: '',
                  title: '3D Design',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'environment-art': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/environment-art',
                      tagID: 'caas:topic/3d-ar/3d-design/environment-art',
                      name: 'environment-art',
                      tagImage: '',
                      title: 'Environment Art',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    software: {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/software',
                      tagID: 'caas:topic/3d-ar/3d-design/software',
                      name: 'software',
                      tagImage: '',
                      title: 'Software',
                      description: '',
                      'cq:movedTo': '',
                      tags: {
                        blender: {
                          path: '/content/cq:tags/caas/topic/3d-ar/3d-design/software/blender',
                          tagID: 'caas:topic/3d-ar/3d-design/software/blender',
                          name: 'blender',
                          tagImage: '',
                          title: 'Blender',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        autodesk: {
                          path: '/content/cq:tags/caas/topic/3d-ar/3d-design/software/autodesk',
                          tagID: 'caas:topic/3d-ar/3d-design/software/autodesk',
                          name: 'autodesk',
                          tagImage: '',
                          title: 'Autodesk',
                          description: '',
                          'cq:movedTo': '',
                          tags: {
                            '3ds-max': {
                              path: '/content/cq:tags/caas/topic/3d-ar/3d-design/software/autodesk/3ds-max',
                              tagID: 'caas:topic/3d-ar/3d-design/software/autodesk/3ds-max',
                              name: '3ds-max',
                              tagImage: '',
                              title: '3ds MAX',
                              description: '',
                              'cq:movedTo': '',
                              tags: {},
                            },
                            maya: {
                              path: '/content/cq:tags/caas/topic/3d-ar/3d-design/software/autodesk/maya',
                              tagID: 'caas:topic/3d-ar/3d-design/software/autodesk/maya',
                              name: 'maya',
                              tagImage: '',
                              title: 'Maya',
                              description: '',
                              'cq:movedTo': '',
                              tags: {},
                            },
                          },
                        },
                        painting: {
                          path: '/content/cq:tags/caas/topic/3d-ar/3d-design/software/painting',
                          tagID: 'caas:topic/3d-ar/3d-design/software/painting',
                          name: 'painting',
                          tagImage: '',
                          title: 'Painting',
                          description: '',
                          'cq:movedTo': '',
                          tags: {
                            mari: {
                              path: '/content/cq:tags/caas/topic/3d-ar/3d-design/software/painting/mari',
                              tagID: 'caas:topic/3d-ar/3d-design/software/painting/mari',
                              name: 'mari',
                              tagImage: '',
                              title: 'Mari',
                              description: '',
                              'cq:movedTo': '',
                              tags: {},
                            },
                          },
                        },
                        'substance-plugins': {
                          path: '/content/cq:tags/caas/topic/3d-ar/3d-design/software/substance-plugins',
                          tagID: 'caas:topic/3d-ar/3d-design/software/substance-plugins',
                          name: 'substance-plugins',
                          tagImage: '',
                          title: 'Substance Plugins',
                          description: '',
                          'cq:movedTo': '',
                          tags: {
                            renderman: {
                              path: '/content/cq:tags/caas/topic/3d-ar/3d-design/software/substance-plugins/renderman',
                              tagID: 'caas:topic/3d-ar/3d-design/software/substance-plugins/renderman',
                              name: 'renderman',
                              tagImage: '',
                              title: 'Renderman',
                              description: '',
                              'cq:movedTo': '',
                              tags: {},
                            },
                          },
                        },
                      },
                    },
                    '3d-lighting': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/3d-lighting',
                      tagID: 'caas:topic/3d-ar/3d-design/3d-lighting',
                      name: '3d-lighting',
                      tagImage: '',
                      title: '3D Lighting',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    scan: {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/scan',
                      tagID: 'caas:topic/3d-ar/3d-design/scan',
                      name: 'scan',
                      tagImage: '',
                      title: 'Scan',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'automotive-design': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/automotive-design',
                      tagID: 'caas:topic/3d-ar/3d-design/automotive-design',
                      name: 'automotive-design',
                      tagImage: '',
                      title: 'Automotive Design',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    '3d-rendering': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/3d-rendering',
                      tagID: 'caas:topic/3d-ar/3d-design/3d-rendering',
                      name: '3d-rendering',
                      tagImage: '',
                      title: '3D Rendering',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    '2d-concept': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/2d-concept',
                      tagID: 'caas:topic/3d-ar/3d-design/2d-concept',
                      name: '2d-concept',
                      tagImage: '',
                      title: '2D Concept',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    photorealistic: {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/photorealistic',
                      tagID: 'caas:topic/3d-ar/3d-design/photorealistic',
                      name: 'photorealistic',
                      tagImage: '',
                      title: 'Photorealistic',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'visual-effects': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/visual-effects',
                      tagID: 'caas:topic/3d-ar/3d-design/visual-effects',
                      name: 'visual-effects',
                      tagImage: '',
                      title: 'Visual Effects (VFX)',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'visual-story-telling': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/visual-story-telling',
                      tagID: 'caas:topic/3d-ar/3d-design/visual-story-telling',
                      name: 'visual-story-telling',
                      tagImage: '',
                      title: 'Visual Storytelling',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    '3d-visualization': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/3d-visualization',
                      tagID: 'caas:topic/3d-ar/3d-design/3d-visualization',
                      name: '3d-visualization',
                      tagImage: '',
                      title: '3D Visualization',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    '3d-shape': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/3d-shape',
                      tagID: 'caas:topic/3d-ar/3d-design/3d-shape',
                      name: '3d-shape',
                      tagImage: '',
                      title: '3D Shape',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    '3d-fabrics': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/3d-fabrics',
                      tagID: 'caas:topic/3d-ar/3d-design/3d-fabrics',
                      name: '3d-fabrics',
                      tagImage: '',
                      title: '3D Fabrics',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    kitbashing: {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/kitbashing',
                      tagID: 'caas:topic/3d-ar/3d-design/kitbashing',
                      name: 'kitbashing',
                      tagImage: '',
                      title: 'Kitbashing',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    texturing: {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/texturing',
                      tagID: 'caas:topic/3d-ar/3d-design/texturing',
                      name: 'texturing',
                      tagImage: '',
                      title: 'Texturing',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    cad: {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/cad',
                      tagID: 'caas:topic/3d-ar/3d-design/cad',
                      name: 'cad',
                      tagImage: '',
                      title: 'CAD',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    staging: {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/staging',
                      tagID: 'caas:topic/3d-ar/3d-design/staging',
                      name: 'staging',
                      tagImage: '',
                      title: 'Staging',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'ethical-design': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/ethical-design',
                      tagID: 'caas:topic/3d-ar/3d-design/ethical-design',
                      name: 'ethical-design',
                      tagImage: '',
                      title: 'Ethical Design',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    workflow: {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/workflow',
                      tagID: 'caas:topic/3d-ar/3d-design/workflow',
                      name: 'workflow',
                      tagImage: '',
                      title: 'Workflow',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'digital-painting': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/digital-painting',
                      tagID: 'caas:topic/3d-ar/3d-design/digital-painting',
                      name: 'digital-painting',
                      tagImage: '',
                      title: 'Digital Painting',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    inspiration: {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/inspiration',
                      tagID: 'caas:topic/3d-ar/3d-design/inspiration',
                      name: 'inspiration',
                      tagImage: '',
                      title: 'Inspiration',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    '3d-printing': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/3d-printing',
                      tagID: 'caas:topic/3d-ar/3d-design/3d-printing',
                      name: '3d-printing',
                      tagImage: '',
                      title: '3D Printing',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    sculpture: {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/sculpture',
                      tagID: 'caas:topic/3d-ar/3d-design/sculpture',
                      name: 'sculpture',
                      tagImage: '',
                      title: 'Sculpture',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'pipeline-adobe-tools': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/pipeline-adobe-tools',
                      tagID: 'caas:topic/3d-ar/3d-design/pipeline-adobe-tools',
                      name: 'pipeline-adobe-tools',
                      tagImage: '',
                      title: '3D Pipeline of Adobe Tools',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'do-it-yourself-method': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/do-it-yourself-method',
                      tagID: 'caas:topic/3d-ar/3d-design/do-it-yourself-method',
                      name: 'do-it-yourself-method',
                      tagImage: '',
                      title: 'Do-It-Yourself Method',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    nodes: {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/nodes',
                      tagID: 'caas:topic/3d-ar/3d-design/nodes',
                      name: 'nodes',
                      tagImage: '',
                      title: 'Node',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    particles: {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-design/particles',
                      tagID: 'caas:topic/3d-ar/3d-design/particles',
                      name: 'particles',
                      tagImage: '',
                      title: 'Particles',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                'character-art': {
                  path: '/content/cq:tags/caas/topic/3d-ar/character-art',
                  tagID: 'caas:topic/3d-ar/character-art',
                  name: 'character-art',
                  tagImage: '',
                  title: 'Character Art',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'material-design': {
                  path: '/content/cq:tags/caas/topic/3d-ar/material-design',
                  tagID: 'caas:topic/3d-ar/material-design',
                  name: 'material-design',
                  tagImage: '',
                  title: 'Material Design',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                animation: {
                  path: '/content/cq:tags/caas/topic/3d-ar/animation',
                  tagID: 'caas:topic/3d-ar/animation',
                  name: 'animation',
                  tagImage: '',
                  title: 'Animation',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'stylized-art': {
                  path: '/content/cq:tags/caas/topic/3d-ar/stylized-art',
                  tagID: 'caas:topic/3d-ar/stylized-art',
                  name: 'stylized-art',
                  tagImage: '',
                  title: 'Stylized Art',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                '3d-modeling': {
                  path: '/content/cq:tags/caas/topic/3d-ar/3d-modeling',
                  tagID: 'caas:topic/3d-ar/3d-modeling',
                  name: '3d-modeling',
                  tagImage: '',
                  title: '3D Modeling',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'cinema-4d': {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-modeling/cinema-4d',
                      tagID: 'caas:topic/3d-ar/3d-modeling/cinema-4d',
                      name: 'cinema-4d',
                      tagImage: '',
                      title: 'Cinema 4D',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    software: {
                      path: '/content/cq:tags/caas/topic/3d-ar/3d-modeling/software',
                      tagID: 'caas:topic/3d-ar/3d-modeling/software',
                      name: 'software',
                      tagImage: '',
                      title: '3D Modeling Software',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                apparel: {
                  path: '/content/cq:tags/caas/topic/3d-ar/apparel',
                  tagID: 'caas:topic/3d-ar/apparel',
                  name: 'apparel',
                  tagImage: '',
                  title: 'Apparel',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'footwear-design': {
                      path: '/content/cq:tags/caas/topic/3d-ar/apparel/footwear-design',
                      tagID: 'caas:topic/3d-ar/apparel/footwear-design',
                      name: 'footwear-design',
                      tagImage: '',
                      title: 'Footwear Design',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    fashion: {
                      path: '/content/cq:tags/caas/topic/3d-ar/apparel/fashion',
                      tagID: 'caas:topic/3d-ar/apparel/fashion',
                      name: 'fashion',
                      tagImage: '',
                      title: 'Fashion',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                'industrial-design': {
                  path: '/content/cq:tags/caas/topic/3d-ar/industrial-design',
                  tagID: 'caas:topic/3d-ar/industrial-design',
                  name: 'industrial-design',
                  tagImage: '',
                  title: 'Industrial Design',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                technologies: {
                  path: '/content/cq:tags/caas/topic/3d-ar/technologies',
                  tagID: 'caas:topic/3d-ar/technologies',
                  name: 'technologies',
                  tagImage: '',
                  title: 'Technologies',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'augmented-reality': {
                      path: '/content/cq:tags/caas/topic/3d-ar/technologies/augmented-reality',
                      tagID: 'caas:topic/3d-ar/technologies/augmented-reality',
                      name: 'augmented-reality',
                      tagImage: '',
                      title: 'AR',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'virtual-photography': {
                      path: '/content/cq:tags/caas/topic/3d-ar/technologies/virtual-photography',
                      tagID: 'caas:topic/3d-ar/technologies/virtual-photography',
                      name: 'virtual-photography',
                      tagImage: '',
                      title: 'Virtual Photography',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    hdri: {
                      path: '/content/cq:tags/caas/topic/3d-ar/technologies/hdri',
                      tagID: 'caas:topic/3d-ar/technologies/hdri',
                      name: 'hdri',
                      tagImage: '',
                      title: 'High Dynamic Range Image (HDRI)',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'virtual-reality': {
                      path: '/content/cq:tags/caas/topic/3d-ar/technologies/virtual-reality',
                      tagID: 'caas:topic/3d-ar/technologies/virtual-reality',
                      name: 'virtual-reality',
                      tagImage: '',
                      title: 'Virtual Reality (VR)',
                      description: '',
                      'cq:movedTo': '',
                      tags: {
                        metaverse: {
                          path: '/content/cq:tags/caas/topic/3d-ar/technologies/virtual-reality/metaverse',
                          tagID: 'caas:topic/3d-ar/technologies/virtual-reality/metaverse',
                          name: 'metaverse',
                          tagImage: '',
                          title: 'Metaverse',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        'immersive-experiences': {
                          path: '/content/cq:tags/caas/topic/3d-ar/technologies/virtual-reality/immersive-experiences',
                          tagID: 'caas:topic/3d-ar/technologies/virtual-reality/immersive-experiences',
                          name: 'immersive-experiences',
                          tagImage: '',
                          title: 'Immersive Experiences',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        bots: {
                          path: '/content/cq:tags/caas/topic/3d-ar/technologies/virtual-reality/bots',
                          tagID: 'caas:topic/3d-ar/technologies/virtual-reality/bots',
                          name: 'bots',
                          tagImage: '',
                          title: 'Bots',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                      },
                    },
                    'computer-generated-imagery': {
                      path: '/content/cq:tags/caas/topic/3d-ar/technologies/computer-generated-imagery',
                      tagID: 'caas:topic/3d-ar/technologies/computer-generated-imagery',
                      name: 'computer-generated-imagery',
                      tagImage: '',
                      title: 'Computer-Generated Imagery (CGI)',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'machine-learning': {
                      path: '/content/cq:tags/caas/topic/3d-ar/technologies/machine-learning',
                      tagID: 'caas:topic/3d-ar/technologies/machine-learning',
                      name: 'machine-learning',
                      tagImage: '',
                      title: 'Machine Learning',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    ai: {
                      path: '/content/cq:tags/caas/topic/3d-ar/technologies/ai',
                      tagID: 'caas:topic/3d-ar/technologies/ai',
                      name: 'ai',
                      tagImage: '',
                      title: 'AI',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                features: {
                  path: '/content/cq:tags/caas/topic/3d-ar/features',
                  tagID: 'caas:topic/3d-ar/features',
                  name: 'features',
                  tagImage: '',
                  title: 'Features',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    '3d-assets': {
                      path: '/content/cq:tags/caas/topic/3d-ar/features/3d-assets',
                      tagID: 'caas:topic/3d-ar/features/3d-assets',
                      name: '3d-assets',
                      tagImage: '',
                      title: '3D Assets',
                      description: '',
                      'cq:movedTo': '',
                      tags: {
                        'environment-stages': {
                          path: '/content/cq:tags/caas/topic/3d-ar/features/3d-assets/environment-stages',
                          tagID: 'caas:topic/3d-ar/features/3d-assets/environment-stages',
                          name: 'environment-stages',
                          tagImage: '',
                          title: 'Environment Stages',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                      },
                    },
                    painter: {
                      path: '/content/cq:tags/caas/topic/3d-ar/features/painter',
                      tagID: 'caas:topic/3d-ar/features/painter',
                      name: 'painter',
                      tagImage: '',
                      title: 'Painter',
                      description: '',
                      'cq:movedTo': '',
                      tags: {
                        'uv-unwrapping': {
                          path: '/content/cq:tags/caas/topic/3d-ar/features/painter/uv-unwrapping',
                          tagID: 'caas:topic/3d-ar/features/painter/uv-unwrapping',
                          name: 'uv-unwrapping',
                          tagImage: '',
                          title: 'UV Unwrapping',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                        displacement: {
                          path: '/content/cq:tags/caas/topic/3d-ar/features/painter/displacement',
                          tagID: 'caas:topic/3d-ar/features/painter/displacement',
                          name: 'displacement',
                          tagImage: '',
                          title: 'Displacement',
                          description: '',
                          'cq:movedTo': '',
                          tags: {},
                        },
                      },
                    },
                    'procedural-modeling': {
                      path: '/content/cq:tags/caas/topic/3d-ar/features/procedural-modeling',
                      tagID: 'caas:topic/3d-ar/features/procedural-modeling',
                      name: 'procedural-modeling',
                      tagImage: '',
                      title: 'Procedural Modeling',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    atlases: {
                      path: '/content/cq:tags/caas/topic/3d-ar/features/atlases',
                      tagID: 'caas:topic/3d-ar/features/atlases',
                      name: 'atlases',
                      tagImage: '',
                      title: 'Parametric Atlases',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'warp-mode': {
                      path: '/content/cq:tags/caas/topic/3d-ar/features/warp-mode',
                      tagID: 'caas:topic/3d-ar/features/warp-mode',
                      name: 'warp-mode',
                      tagImage: '',
                      title: 'Warp Mode',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                'color-material-finish-design': {
                  path: '/content/cq:tags/caas/topic/3d-ar/color-material-finish-design',
                  tagID: 'caas:topic/3d-ar/color-material-finish-design',
                  name: 'color-material-finish-design',
                  tagImage: '',
                  title: 'Color Material Finish (CMF) Design',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'product-design': {
                  path: '/content/cq:tags/caas/topic/3d-ar/product-design',
                  tagID: 'caas:topic/3d-ar/product-design',
                  name: 'product-design',
                  tagImage: '',
                  title: 'Product Design',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    rendering: {
                      path: '/content/cq:tags/caas/topic/3d-ar/product-design/rendering',
                      tagID: 'caas:topic/3d-ar/product-design/rendering',
                      name: 'rendering',
                      tagImage: '',
                      title: 'Product Render',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    visualization: {
                      path: '/content/cq:tags/caas/topic/3d-ar/product-design/visualization',
                      tagID: 'caas:topic/3d-ar/product-design/visualization',
                      name: 'visualization',
                      tagImage: '',
                      title: 'Product Vizualization',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    bikes: {
                      path: '/content/cq:tags/caas/topic/3d-ar/product-design/bikes',
                      tagID: 'caas:topic/3d-ar/product-design/bikes',
                      name: 'bikes',
                      tagImage: '',
                      title: 'Bikes',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    toys: {
                      path: '/content/cq:tags/caas/topic/3d-ar/product-design/toys',
                      tagID: 'caas:topic/3d-ar/product-design/toys',
                      name: 'toys',
                      tagImage: '',
                      title: 'Toys',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                community: {
                  path: '/content/cq:tags/caas/topic/3d-ar/community',
                  tagID: 'caas:topic/3d-ar/community',
                  name: 'community',
                  tagImage: '',
                  title: 'Community',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    'design-students': {
                      path: '/content/cq:tags/caas/topic/3d-ar/community/design-students',
                      tagID: 'caas:topic/3d-ar/community/design-students',
                      name: 'design-students',
                      tagImage: '',
                      title: 'Design Students',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'the-rookies': {
                      path: '/content/cq:tags/caas/topic/3d-ar/community/the-rookies',
                      tagID: 'caas:topic/3d-ar/community/the-rookies',
                      name: 'the-rookies',
                      tagImage: '',
                      title: 'The Rookies',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'substance-designers': {
                      path: '/content/cq:tags/caas/topic/3d-ar/community/substance-designers',
                      tagID: 'caas:topic/3d-ar/community/substance-designers',
                      name: 'substance-designers',
                      tagImage: '',
                      title: 'Substance Designers',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                    'personal-projects': {
                      path: '/content/cq:tags/caas/topic/3d-ar/community/personal-projects',
                      tagID: 'caas:topic/3d-ar/community/personal-projects',
                      name: 'personal-projects',
                      tagImage: '',
                      title: 'Personal Projects',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                tools: {
                  path: '/content/cq:tags/caas/topic/3d-ar/tools',
                  tagID: 'caas:topic/3d-ar/tools',
                  name: 'tools',
                  tagImage: '',
                  title: 'Tools',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    zbrush: {
                      path: '/content/cq:tags/caas/topic/3d-ar/tools/zbrush',
                      tagID: 'caas:topic/3d-ar/tools/zbrush',
                      name: 'zbrush',
                      tagImage: '',
                      title: 'ZBrush',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
                'graphic-design': {
                  path: '/content/cq:tags/caas/topic/3d-ar/graphic-design',
                  tagID: 'caas:topic/3d-ar/graphic-design',
                  name: 'graphic-design',
                  tagImage: '',
                  title: 'Graphic Design',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                '3d-production': {
                  path: '/content/cq:tags/caas/topic/3d-ar/3d-production',
                  tagID: 'caas:topic/3d-ar/3d-production',
                  name: '3d-production',
                  tagImage: '',
                  title: '3D Production',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                'star-wars': {
                  path: '/content/cq:tags/caas/topic/3d-ar/star-wars',
                  tagID: 'caas:topic/3d-ar/star-wars',
                  name: 'star-wars',
                  tagImage: '',
                  title: 'Star Wars',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                india: {
                  path: '/content/cq:tags/caas/topic/3d-ar/india',
                  tagID: 'caas:topic/3d-ar/india',
                  name: 'india',
                  tagImage: '',
                  title: 'India',
                  description: '',
                  'cq:movedTo': '',
                  tags: {},
                },
                events: {
                  path: '/content/cq:tags/caas/topic/3d-ar/events',
                  tagID: 'caas:topic/3d-ar/events',
                  name: 'events',
                  tagImage: '',
                  title: 'Events',
                  description: '',
                  'cq:movedTo': '',
                  tags: {
                    gdc: {
                      path: '/content/cq:tags/caas/topic/3d-ar/events/gdc',
                      tagID: 'caas:topic/3d-ar/events/gdc',
                      name: 'gdc',
                      tagImage: '',
                      title: 'Game Developers Conference (GDC)',
                      description: '',
                      'cq:movedTo': '',
                      tags: {},
                    },
                  },
                },
              },
            },
            'content-supply-chain': {
              path: '/content/cq:tags/caas/topic/content-supply-chain',
              tagID: 'caas:topic/content-supply-chain',
              name: 'content-supply-chain',
              tagImage: '',
              title: 'Content Supply Chain',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'add-pdf-page-numbers': {
              path: '/content/cq:tags/caas/topic/add-pdf-page-numbers',
              tagID: 'caas:topic/add-pdf-page-numbers',
              name: 'add-pdf-page-numbers',
              tagImage: '',
              title: 'add-pdf-page-numbers',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'ai-prompts': {
              path: '/content/cq:tags/caas/topic/ai-prompts',
              tagID: 'caas:topic/ai-prompts',
              name: 'ai-prompts',
              tagImage: '',
              title: 'AI Prompts',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            trends: {
              path: '/content/cq:tags/caas/topic/trends',
              tagID: 'caas:topic/trends',
              name: 'trends',
              tagImage: '',
              title: 'Trends',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            news: {
              path: '/content/cq:tags/caas/topic/news',
              tagID: 'caas:topic/news',
              name: 'news',
              tagImage: '',
              title: 'News',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        'technical-level': {
          path: '/content/cq:tags/caas/technical-level',
          tagID: 'caas:technical-level',
          name: 'technical-level',
          tagImage: '',
          title: 'Technical Level',
          description: '',
          'cq:movedTo': '',
          tags: {
            beginner: {
              path: '/content/cq:tags/caas/technical-level/beginner',
              tagID: 'caas:technical-level/beginner',
              name: 'beginner',
              tagImage: '',
              title: 'Beginner',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            intermediate: {
              path: '/content/cq:tags/caas/technical-level/intermediate',
              tagID: 'caas:technical-level/intermediate',
              name: 'intermediate',
              tagImage: '',
              title: 'Intermediate',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            advanced: {
              path: '/content/cq:tags/caas/technical-level/advanced',
              tagID: 'caas:technical-level/advanced',
              name: 'advanced',
              tagImage: '',
              title: 'Advanced',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        features: {
          path: '/content/cq:tags/caas/features',
          tagID: 'caas:features',
          name: 'features',
          tagImage: '',
          title: 'Features',
          description: '',
          'cq:movedTo': '',
          tags: {
            brushes: {
              path: '/content/cq:tags/caas/features/brushes',
              tagID: 'caas:features/brushes',
              name: 'brushes',
              tagImage: '',
              title: 'Brushes',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'edit-photos': {
              path: '/content/cq:tags/caas/features/edit-photos',
              tagID: 'caas:features/edit-photos',
              name: 'edit-photos',
              tagImage: '',
              title: 'Edit photos',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            color: {
              path: '/content/cq:tags/caas/features/color',
              tagID: 'caas:features/color',
              name: 'color',
              tagImage: '',
              title: 'Color',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            layers: {
              path: '/content/cq:tags/caas/features/layers',
              tagID: 'caas:features/layers',
              name: 'layers',
              tagImage: '',
              title: 'Layers',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        availability: {
          path: '/content/cq:tags/caas/availability',
          tagID: 'caas:availability',
          name: 'availability',
          tagImage: '',
          title: 'Availability',
          description: '',
          'cq:movedTo': '',
          tags: {
            'on-demand': {
              path: '/content/cq:tags/caas/availability/on-demand',
              tagID: 'caas:availability/on-demand',
              name: 'on-demand',
              tagImage: '',
              title: 'On-demand',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            upcoming: {
              path: '/content/cq:tags/caas/availability/upcoming',
              tagID: 'caas:availability/upcoming',
              name: 'upcoming',
              tagImage: '',
              title: 'Upcoming',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        'business-size': {
          path: '/content/cq:tags/caas/business-size',
          tagID: 'caas:business-size',
          name: 'business-size',
          tagImage: '',
          title: 'Business size',
          description: '',
          'cq:movedTo': '',
          tags: {
            enterprise: {
              path: '/content/cq:tags/caas/business-size/enterprise',
              tagID: 'caas:business-size/enterprise',
              name: 'enterprise',
              tagImage: '',
              title: 'Enterprise',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            smb: {
              path: '/content/cq:tags/caas/business-size/smb',
              tagID: 'caas:business-size/smb',
              name: 'smb',
              tagImage: '',
              title: 'SMB',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        collection: {
          path: '/content/cq:tags/caas/collection',
          tagID: 'caas:collection',
          name: 'collection',
          tagImage: '',
          title: 'Collection',
          description: '',
          'cq:movedTo': '',
          tags: {
            collection: {
              path: '/content/cq:tags/caas/collection/collection',
              tagID: 'caas:collection/collection',
              name: 'collection',
              tagImage: '',
              title: 'Collection',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'dx-resources': {
              path: '/content/cq:tags/caas/collection/dx-resources',
              tagID: 'caas:collection/dx-resources',
              name: 'dx-resources',
              tagImage: '',
              title: 'DX resources',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        'customer-story-type': {
          path: '/content/cq:tags/caas/customer-story-type',
          tagID: 'caas:customer-story-type',
          name: 'customer-story-type',
          tagImage: '',
          title: 'Customer story type',
          description: '',
          'cq:movedTo': '',
          tags: {
            'experience-makers': {
              path: '/content/cq:tags/caas/customer-story-type/experience-makers',
              tagID: 'caas:customer-story-type/experience-makers',
              name: 'experience-makers',
              tagImage: '',
              title: 'Experience Makers',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        form: {
          path: '/content/cq:tags/caas/form',
          tagID: 'caas:form',
          name: 'form',
          tagImage: '',
          title: 'Form',
          description: '',
          'cq:movedTo': '',
          tags: {
            '3rd-party': {
              path: '/content/cq:tags/caas/form/3rd-party',
              tagID: 'caas:form/3rd-party',
              name: '3rd-party',
              tagImage: '',
              title: '3rd party',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'faas-79': {
              path: '/content/cq:tags/caas/form/faas-79',
              tagID: 'caas:form/faas-79',
              name: 'faas-79',
              tagImage: '',
              title: 'faas 79',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'faas-rfi': {
              path: '/content/cq:tags/caas/form/faas-rfi',
              tagID: 'caas:form/faas-rfi',
              name: 'faas-rfi',
              tagImage: '',
              title: 'faas-rfi',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        region: {
          path: '/content/cq:tags/caas/region',
          tagID: 'caas:region',
          name: 'region',
          tagImage: '',
          title: 'Region',
          description: '',
          'cq:movedTo': '',
          tags: {
            apac: {
              path: '/content/cq:tags/caas/region/apac',
              tagID: 'caas:region/apac',
              name: 'apac',
              tagImage: '',
              title: 'APAC',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'australia-and-new-zealand': {
              path: '/content/cq:tags/caas/region/australia-and-new-zealand',
              tagID: 'caas:region/australia-and-new-zealand',
              name: 'australia-and-new-zealand',
              tagImage: '',
              title: 'Australia and New Zealand',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            china: {
              path: '/content/cq:tags/caas/region/china',
              tagID: 'caas:region/china',
              name: 'china',
              tagImage: '',
              title: 'China',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            emea: {
              path: '/content/cq:tags/caas/region/emea',
              tagID: 'caas:region/emea',
              name: 'emea',
              tagImage: '',
              title: 'EMEA',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            india: {
              path: '/content/cq:tags/caas/region/india',
              tagID: 'caas:region/india',
              name: 'india',
              tagImage: '',
              title: 'India',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            japan: {
              path: '/content/cq:tags/caas/region/japan',
              tagID: 'caas:region/japan',
              name: 'japan',
              tagImage: '',
              title: 'Japan',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            korea: {
              path: '/content/cq:tags/caas/region/korea',
              tagID: 'caas:region/korea',
              name: 'korea',
              tagImage: '',
              title: 'Korea',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'north-america': {
              path: '/content/cq:tags/caas/region/north-america',
              tagID: 'caas:region/north-america',
              name: 'north-america',
              tagImage: '',
              title: 'North America',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'south-east-asia': {
              path: '/content/cq:tags/caas/region/south-east-asia',
              tagID: 'caas:region/south-east-asia',
              name: 'south-east-asia',
              tagImage: '',
              title: 'South East Asia',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            uk: {
              path: '/content/cq:tags/caas/region/uk',
              tagID: 'caas:region/uk',
              name: 'uk',
              tagImage: '',
              title: 'UK',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'hong-kong': {
              path: '/content/cq:tags/caas/region/hong-kong',
              tagID: 'caas:region/hong-kong',
              name: 'hong-kong',
              tagImage: '',
              title: 'Hong Kong',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'latin-america': {
              path: '/content/cq:tags/caas/region/latin-america',
              tagID: 'caas:region/latin-america',
              name: 'latin-america',
              tagImage: '',
              title: 'Latin America',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        'related-product': {
          path: '/content/cq:tags/caas/related-product',
          tagID: 'caas:related-product',
          name: 'related-product',
          tagImage: '',
          title: 'Related Product',
          description: '',
          'cq:movedTo': '',
          tags: {
            'adobe-customer-solutions': {
              path: '/content/cq:tags/caas/related-product/adobe-customer-solutions',
              tagID: 'caas:related-product/adobe-customer-solutions',
              name: 'adobe-customer-solutions',
              tagImage: '',
              title: 'Adobe Customer Solutions',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            analytics: {
              path: '/content/cq:tags/caas/related-product/analytics',
              tagID: 'caas:related-product/analytics',
              name: 'analytics',
              tagImage: '',
              title: 'Analytics',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            campaign: {
              path: '/content/cq:tags/caas/related-product/campaign',
              tagID: 'caas:related-product/campaign',
              name: 'campaign',
              tagImage: '',
              title: 'Campaign',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'creative-cloud': {
              path: '/content/cq:tags/caas/related-product/creative-cloud',
              tagID: 'caas:related-product/creative-cloud',
              name: 'creative-cloud',
              tagImage: '',
              title: 'Creative Cloud',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'experience-manager': {
              path: '/content/cq:tags/caas/related-product/experience-manager',
              tagID: 'caas:related-product/experience-manager',
              name: 'experience-manager',
              tagImage: '',
              title: 'Experience Manager',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'experience-manager-assets': {
              path: '/content/cq:tags/caas/related-product/experience-manager-assets',
              tagID: 'caas:related-product/experience-manager-assets',
              name: 'experience-manager-assets',
              tagImage: '',
              title: 'Experience Manager Assets',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'experience-manager-sites': {
              path: '/content/cq:tags/caas/related-product/experience-manager-sites',
              tagID: 'caas:related-product/experience-manager-sites',
              name: 'experience-manager-sites',
              tagImage: '',
              title: 'Experience Manager Sites',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'experience-platform': {
              path: '/content/cq:tags/caas/related-product/experience-platform',
              tagID: 'caas:related-product/experience-platform',
              name: 'experience-platform',
              tagImage: '',
              title: 'Experience Platform',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'magento-commerce': {
              path: '/content/cq:tags/caas/related-product/magento-commerce',
              tagID: 'caas:related-product/magento-commerce',
              name: 'magento-commerce',
              tagImage: '',
              title: 'Magento Commerce',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'marketo-engage': {
              path: '/content/cq:tags/caas/related-product/marketo-engage',
              tagID: 'caas:related-product/marketo-engage',
              name: 'marketo-engage',
              tagImage: '',
              title: 'Marketo Engage',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            stock: {
              path: '/content/cq:tags/caas/related-product/stock',
              tagID: 'caas:related-product/stock',
              name: 'stock',
              tagImage: '',
              title: 'Stock',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            target: {
              path: '/content/cq:tags/caas/related-product/target',
              tagID: 'caas:related-product/target',
              name: 'target',
              tagImage: '',
              title: 'Target',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
        summit: {
          path: '/content/cq:tags/caas/summit',
          tagID: 'caas:summit',
          name: 'summit',
          tagImage: '',
          title: 'Summit',
          description: '',
          'cq:movedTo': '',
          tags: {},
        },
        'webinar-timing': {
          path: '/content/cq:tags/caas/webinar-timing',
          tagID: 'caas:webinar-timing',
          name: 'webinar-timing',
          tagImage: '',
          title: 'Webinar Timing',
          description: '',
          'cq:movedTo': '',
          tags: {
            live: {
              path: '/content/cq:tags/caas/webinar-timing/live',
              tagID: 'caas:webinar-timing/live',
              name: 'live',
              tagImage: '',
              title: 'Live',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            'on-demand': {
              path: '/content/cq:tags/caas/webinar-timing/on-demand',
              tagID: 'caas:webinar-timing/on-demand',
              name: 'on-demand',
              tagImage: '',
              title: 'On Demand',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
            upcoming: {
              path: '/content/cq:tags/caas/webinar-timing/upcoming',
              tagID: 'caas:webinar-timing/upcoming',
              name: 'upcoming',
              tagImage: '',
              title: 'Upcoming',
              description: '',
              'cq:movedTo': '',
              tags: {},
            },
          },
        },
      },
    },
  },
};

const caasTags$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: caasTags
}, Symbol.toStringTag, { value: 'Module' }));

export { CONFIG$1 as CONFIG, LANGMAP, init$8 as default, getUniversalNavLocale, osMap };
