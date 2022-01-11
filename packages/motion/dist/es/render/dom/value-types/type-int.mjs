import { __assign } from 'tslib';
import { number } from 'style-value-types';

var int = __assign(__assign({}, number), { transform: Math.round });

export { int };
