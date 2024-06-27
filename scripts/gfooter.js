import { GlobalFooter } from '/static/libs/global-footer/global-footer.js';

const consumerConfig = {
    myConfig: 'Snehal from consumer site',
    imsClientId: 'milo', // Consumer can pass {consumerimsClientId}, it will take precedence over milo imsClientId
    miloLibs: 'https://main--milo--adobecom.hlx.page/libs', //Consumer can pass {consumermiloLibs}, it will take precedence over miloLibs
    nonMiloFooterUrl: 'https://main--federal--adobecom.hlx.page/drafts/snehal/footer',
    //nonMiloRoot: 'https://main--milo--adobecom.hlx.page' //Consumer contentRoot to fetch placeholder Ex. 'https://www.stage.adobe.com/cc-shared' 
}

GlobalFooter(document.querySelector("footer"), consumerConfig);
