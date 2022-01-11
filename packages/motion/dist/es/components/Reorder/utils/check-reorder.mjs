import { mix } from 'popmotion';
import { moveItem } from '../../../utils/array.mjs';

function checkReorder(order, value, offset, velocity) {
    if (!velocity)
        return order;
    var index = order.findIndex(function (item) { return item.value === value; });
    if (index === -1)
        return order;
    var nextOffset = velocity > 0 ? 1 : -1;
    var nextItem = order[index + nextOffset];
    if (!nextItem)
        return order;
    var item = order[index];
    var nextLayout = nextItem.layout;
    var nextItemCenter = mix(nextLayout.min, nextLayout.max, 0.5);
    if ((nextOffset === 1 && item.layout.max + offset > nextItemCenter) ||
        (nextOffset === -1 && item.layout.min + offset < nextItemCenter)) {
        return moveItem(order, index, index + nextOffset);
    }
    return order;
}

export { checkReorder };
