import { GlobalFooter } from '/static/libs/global-footer/global-footer.js';

const consumerConfig = {
    myConfig: 'Snehal from consumer site',
    imsClientId: 'milo', //provide consumer client id
    miloLibs: 'https://main--milo--adobecom.hlx.page/libs',
    nonMiloFooterUrl: 'https://main--federal--adobecom.hlx.page/drafts/snehal/footer',
}

GlobalFooter(document.querySelector("footer"), consumerConfig);
