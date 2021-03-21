import {createElement as ReactDotCreateElement} from 'react';

export const createElement = comp => props => children => ReactDotCreateElement(comp, props, children)
export const createNoChild = comp => props => ReactDotCreateElement(comp, props)
export const createOption = createElement ('option')

