import { camelToDash } from '../../dom/utils/camel-to-dash.mjs';
import { renderHTML } from '../../html/utils/render.mjs';
import { camelCaseAttributes } from './camel-case-attrs.mjs';

function renderSVG(element, renderState) {
    renderHTML(element, renderState);
    for (var key in renderState.attrs) {
        element.setAttribute(!camelCaseAttributes.has(key) ? camelToDash(key) : key, renderState.attrs[key]);
    }
}

export { renderSVG };
