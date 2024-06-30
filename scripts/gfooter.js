import { GlobalFooter } from 'https://stagefootercss--milo--sonawanesnehal3.hlx.page/libs/deps/global-footer/global-footer.js';

const consumerConfig = {
    imsClientId: 'milo', // Consumer can pass {consumerimsClientId}, it will take precedence over milo imsClientId
    miloLibs: 'https://stagefootercss--milo--sonawanesnehal3.hlx.page/libs', //Consumer can pass {consumermiloLibs}, it will take precedence over miloLibs
    nonMiloFooterUrl: 'https://main--federal--adobecom.hlx.page/drafts/snehal/footer',
    nonMiloRoot: 'https://main--milo--adobecom.hlx.page' //Consumer contentRoot to fetch placeholder Ex. 'https://www.stage.adobe.com/cc-shared' 
}

GlobalFooter(document.querySelector("footer"), consumerConfig);
