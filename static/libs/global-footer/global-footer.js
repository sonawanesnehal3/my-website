/* eslint-disable no-async-promise-executor */
import {
  decorateAutoBlock,
  decorateLinks,
  getMetadata,
  getConfig,
  setConfig,
  loadBlock,
} from '../../utils/utils.js';

import {
  getFedsPlaceholderConfig,
  getExperienceName,
  getAnalyticsValue,
  loadDecorateMenu,
  fetchAndProcessPlainHtml,
  loadBaseStyles,
  yieldToMain,
  lanaLog,
  logErrorFor,
  toFragment,
  getFederatedUrl,
  federatePictureSources,
} from '../global-navigation/utilities/utilities.js';

import { replaceKey } from '../../features/placeholders.js';

const { miloLibs, codeRoot, locale, mep } = getConfig();
const base = miloLibs || codeRoot;

const CONFIG = {
  socialPlatforms: ['facebook', 'instagram', 'twitter', 'linkedin', 'pinterest', 'discord', 'behance', 'youtube', 'weibo', 'social-media'],
  delays: { decoration: 3000 },
};

class Footer {
  constructor({ block } = {}) {
    this.block = block;
    this.elements = {};
    this.init();
  }

  init = () => logErrorFor(async () => {
    // We initialize the footer decoration logic when either 3s have passed
    // OR when the footer element is close to coming into view
    let decorationTimeout;

    // Set up intersection observer
    const intersectionOptions = { rootMargin: '300px 0px' };

    const observer = new window.IntersectionObserver((entries) => {
      const isIntersecting = entries.find((entry) => entry.isIntersecting === true);

      if (isIntersecting) {
        clearTimeout(decorationTimeout);
        observer.disconnect();
        this.decorateContent();
      }
    }, intersectionOptions);

    observer.observe(this.block);

    // Set timeout after which we load the footer automatically
    decorationTimeout = setTimeout(() => {
      observer.disconnect();
      this.decorateContent();
    }, CONFIG.delays.decoration);
  }, 'Error in global footer init', 'errorType=error,module=global-footer');

  decorateContent = () => logErrorFor(async () => {
    // Fetch footer content
    let nonMiloFooterUrl = combinedConfig && combinedConfig.nonMiloFooterUrl || '';
    const url = nonMiloFooterUrl ? nonMiloFooterUrl : getMetadata('footer-source') || `${locale.contentRoot}/footer`;
    this.body = await fetchAndProcessPlainHtml({
      url,
      shouldDecorateLinks: false,
    })
      .catch((e) => lanaLog({
        message: `Error fetching footer content ${url}`,
        e,
        tags: 'errorType=error,module=global-footer',
      }));

    if (!this.body) return;

    const [region, social] = ['.region-selector', '.social'].map((selector) => this.body.querySelector(selector));
    const [regionParent, socialParent] = [region?.parentElement, social?.parentElement];
    // We remove and add again the region and social elements from the body to make sure
    // they don't get decorated twice
    [regionParent, socialParent].forEach((parent) => parent?.replaceChildren());

    decorateLinks(this.body);

    regionParent?.appendChild(region);
    socialParent?.appendChild(social);

    const path = getFederatedUrl(url);
    federatePictureSources({ section: this.body, forceFederate: path.includes('/federal/') });

    // Order is important, decorateFooter makes use of elements
    // which have already been created in previous steps
    const tasks = [
      loadBaseStyles,
      this.decorateGrid,
      this.decorateProducts,
      this.loadIcons,
      this.decorateRegionPicker,
      this.decorateSocial,
      this.decoratePrivacy,
      this.decorateFooter,
    ];

    for await (const task of tasks) {
      await yieldToMain();
      await task();
    }

    const mepMartech = mep?.martech || '';
    this.block.setAttribute('daa-lh', `gnav|${getExperienceName()}|footer${mepMartech}`);

    this.block.append(this.elements.footer);
  }, 'Failed to decorate footer content', 'errorType=error,module=global-footer');

  loadMenuLogic = async () => {
    this.menuLogic = this.menuLogic || new Promise(async (resolve) => {
      const menuLogic = await loadDecorateMenu();
      this.decorateMenu = menuLogic.decorateMenu;
      this.decorateLinkGroup = menuLogic.decorateLinkGroup;
      resolve();
    });

    return this.menuLogic;
  };

  decorateGrid = async () => {
    this.elements.footerMenu = '';
    const columns = this.body.querySelectorAll(':scope > div > h2:first-child');

    if (!columns || !columns.length) return this.elements.footerMenu;

    this.elements.footerMenu = toFragment`<div class="feds-menu-content"></div>`;
    columns.forEach((column) => this.elements.footerMenu.appendChild(column.parentElement));

    await this.loadMenuLogic();

    await this.decorateMenu({
      item: this.elements.footerMenu,
      type: 'footerMenu',
    });

    this.elements.headlines = this.elements.footerMenu.querySelectorAll('.feds-menu-headline');

    return this.elements.footerMenu;
  };

  loadIcons = async () => {
    const file = await fetch(`${base}/blocks/global-footer/icons.svg`);

    const content = await file.text();
    const elem = toFragment`<div class="feds-footer-icons">${content}</div>`;
    this.block.append(elem);
  };

  decorateProducts = async () => {
    this.elements.featuredProducts = '';

    // Get the featured products wrapper by looking for a link group's parent
    const featuredProductElem = this.body.querySelector('.link-group');
    if (!featuredProductElem) return this.elements.featuredProducts;

    const featuredProductsContent = featuredProductElem.parentElement;
    this.elements.featuredProducts = toFragment`<div class="feds-featuredProducts"></div>`;

    const [placeholder] = await Promise.all([
      replaceKey('featured-products', getFedsPlaceholderConfig()),
      this.loadMenuLogic(),
    ]);

    if (placeholder && placeholder.length) {
      this.elements.featuredProducts
        .append(toFragment`<span class="feds-featuredProducts-label">${placeholder}</span>`);
    }

    featuredProductsContent.querySelectorAll('.link-group').forEach((linkGroup) => {
      this.elements.featuredProducts.append(this.decorateLinkGroup(linkGroup));
    });

    return this.elements.featuredProducts;
  };

  decorateRegionPicker = async () => {
    this.elements.regionPicker = '';
    const regionSelector = this.body.querySelector('.region-selector a');
    if (!regionSelector) return this.elements.regionPicker;

    let url;

    try {
      url = new URL(regionSelector.href);
    } catch (e) {
      lanaLog({ message: `Could not create URL for region picker; href: ${regionSelector.href}`, tags: 'errorType=error,module=global-footer' });
      return this.elements.regionPicker;
    }

    const regionPickerClass = 'feds-regionPicker';
    const regionPickerTextElem = toFragment`<span class="feds-regionPicker-text">${regionSelector.textContent}</span>`;
    const regionPickerElem = toFragment`
      <a
        href="${regionSelector.href}"
        class="${regionPickerClass}"
        aria-expanded="false"
        aria-haspopup="true"
        role="button">
        <svg xmlns="http://www.w3.org/2000/svg" class="feds-regionPicker-globe" focusable="false">
          <use href="#footer-icon-globe" />
        </svg>
        ${regionPickerTextElem}
      </a>`;
    const regionPickerWrapperClass = 'feds-regionPicker-wrapper';
    this.elements.regionPicker = toFragment`<div class="${regionPickerWrapperClass}">
        ${regionPickerElem}
      </div>`;

    const isRegionPickerExpanded = () => regionPickerElem.getAttribute('aria-expanded') === 'true';

    // Note: the region picker currently works only with Milo modals/fragments;
    // in the future we'll need to update this for non-Milo consumers
    if (url.hash !== '') {
      // Hash -> region selector opens a modal
      decorateAutoBlock(regionPickerElem); // add modal-specific attributes
      // TODO remove logs after finding the root cause for the region picker 404s -> MWPW-143627
      if (regionPickerElem.classList[0] !== 'modal') {
        lanaLog({
          message: `Modal block class missing from region picker pre loading the block; locale: ${locale}; regionPickerElem: ${regionPickerElem.outerHTML}`,
          tags: 'errorType=warn,module=global-footer',
        });
      }
      await loadBlock(regionPickerElem); // load modal logic and styles
      if (regionPickerElem.classList[0] !== 'modal') {
        lanaLog({
          message: `Modal block class missing from region picker post loading the block; locale: ${locale}; regionPickerElem: ${regionPickerElem.outerHTML}`,
          tags: 'errorType=warn,module=global-footer',
        });
      }
      // 'decorateAutoBlock' logic replaces class name entirely, need to add it back
      regionPickerElem.classList.add(regionPickerClass);
      regionPickerElem.addEventListener('click', () => {
        if (!isRegionPickerExpanded()) {
          regionPickerElem.setAttribute('aria-expanded', 'true');
        }
      });
      // Set aria-expanded to false when region modal is closed
      window.addEventListener('milo:modal:closed', () => {
        if (isRegionPickerExpanded()) {
          regionPickerElem.setAttribute('aria-expanded', 'false');
        }
      });
    } else {
      // No hash -> region selector expands a dropdown
      regionPickerElem.href = '#'; // reset href value to not get treated as a fragment
      decorateAutoBlock(regionSelector); // add fragment-specific class(es)
      this.elements.regionPicker.append(regionSelector); // add fragment after regionPickerElem
      await loadBlock(regionSelector); // load fragment and replace original link
      // Update aria-expanded on click
      regionPickerElem.addEventListener('click', (e) => {
        e.preventDefault();
        const isDialogActive = regionPickerElem.getAttribute('aria-expanded') === 'true';
        regionPickerElem.setAttribute('aria-expanded', !isDialogActive);
      });
      // Close region picker dropdown on outside click
      document.addEventListener('click', (e) => {
        if (isRegionPickerExpanded()
          && !e.target.closest(`.${regionPickerWrapperClass}`)) {
          regionPickerElem.setAttribute('aria-expanded', false);
        }
      });
    }

    return this.regionPicker;
  };

  decorateSocial = () => {
    this.elements.social = '';
    const socialBlock = this.body.querySelector('.social');
    if (!socialBlock) return this.elements.social;

    const socialElem = toFragment`<ul class="feds-social" daa-lh="Social"></ul>`;

    CONFIG.socialPlatforms.forEach((platform, index) => {
      const link = socialBlock.querySelector(`a[href*="${platform}"]`);
      if (!link) return;

      const iconElem = toFragment`<li class="feds-social-item">
          <a
            href="${link.href}"
            class="feds-social-link"
            aria-label="${platform}"
            daa-ll="${getAnalyticsValue(platform, index + 1)}"
            target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" class="feds-social-icon" alt="${platform} logo">
              <use href="#footer-icon-${platform}" />
            </svg>
          </a>
        </li>`;

      socialElem.append(iconElem);
    });

    this.elements.social = socialElem.childElementCount !== 0 ? socialElem : '';

    return this.elements.social;
  };

  decoratePrivacy = () => {
    this.elements.legal = '';
    // Get the legal links wrapper by looking for the copyright text's parent
    const copyrightElem = this.body.querySelector('div > p > em');
    if (!copyrightElem) return this.elements.legal;

    const privacyContent = copyrightElem.closest('div');

    // Decorate copyright element
    const currentYear = new Date().getFullYear();
    copyrightElem.replaceWith(toFragment`<span class="feds-footer-copyright">
        Copyright © ${currentYear} ${copyrightElem.textContent}
      </span>`);

    // Add Ad Choices icon
    const adChoicesElem = privacyContent.querySelector('a[href*="#interest-based-ads"]');
    adChoicesElem?.prepend(toFragment`<svg xmlns="http://www.w3.org/2000/svg" class="feds-adChoices-icon" focusable="false">
        <use href="#footer-icon-adchoices" />
      </svg>`);

    this.elements.legal = toFragment`<div class="feds-footer-legalWrapper" daa-lh="Legal"></div>`;

    while (privacyContent.children.length) {
      const privacySection = privacyContent.firstElementChild;
      privacySection.classList.add('feds-footer-privacySection');
      privacySection.querySelectorAll('a').forEach((link, index) => {
        link.classList.add('feds-footer-privacyLink');
        link.setAttribute('daa-ll', getAnalyticsValue(link.textContent, index + 1));
      });
      this.elements.legal.append(privacySection);
    }

    return this.elements.legal;
  };

  decorateFooter = () => {
    this.elements.footer = toFragment`<div class="feds-footer-wrapper">
        ${this.elements.footerMenu}
        ${this.elements.featuredProducts}
        <div class="feds-footer-options">
          <div class="feds-footer-miscLinks">
            ${this.elements.regionPicker}
            ${this.elements.social}
          </div>
          ${this.elements.legal}
        </div>
      </div>`;

    return this.elements.footer;
  };
}

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

const customConfig = {
  geoRouting: 'on',
  fallbackRouting: 'on',
  links: 'on',
  codeRoot: '/libs',
  locales,
  prodDomains: 'milo.adobe.com',
  stageDomainsMap: {'www.adobe.com': 'www.stage.adobe.com'},
  //privacyId: '7a5eb705-95ed-4cc4-a11d-0cc5760e93db', // valid for *.adobe.com
  miloLibs: 'https://main--milo--adobecom.hlx.page/libs',
  // taxonomyRoot: '/your-path-here',
};

let combinedConfig;

export default function init(block, consumerConfig) {
  try {
    if(consumerConfig){
      console.log(block);
      combinedConfig = {...customConfig, ...consumerConfig};
      console.log(combinedConfig);
      setConfig(combinedConfig);
      block.classList.add('global-footer');
    }
    const footer = new Footer({ block });
    return footer;
  } catch (e) {
    lanaLog({ message: 'Could not create footer', e });
    return null;
  }
}
