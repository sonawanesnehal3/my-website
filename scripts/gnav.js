import { GlobalNavigation } from '/static/libs/global-navigation/global-navigation.js';

const consumerConfig = {
    myConfig: 'Snehal from consumer site',
    imsClientId: 'milo',
}

GlobalNavigation(document.querySelector("header"), consumerConfig);

console.log(GlobalNavigation);
