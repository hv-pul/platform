import template from './sw-event-action-list-expand-labels.html.twig';
import './sw-event-action-list-expand-labels.scss';

/**
 * @internal (flag:FEATURE_NEXT_9351)
 */
Shopware.Component.register('sw-event-action-list-expand-labels', {
    template,

    props: {
        items: {
            type: Array,
            required: true
        },
        increaseBy: {
            type: Number,
            required: false,
            default: 3
        },
        defaultLimit: {
            type: Number,
            required: false,
            default: 2
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        }
    },

    data() {
        return {
            limit: this.defaultLimit
        };
    },

    methods: {
        increaseLimit() {
            if (this.disabled) {
                return;
            }
            this.limit = this.limit + this.increaseBy;
        }
    },

    computed: {
        classes() {
            return {
                'is--disabled': this.disabled
            };
        },

        limitedItems() {
            return this.items.slice(0, this.limit);
        },

        remainingItemsAmount() {
            return this.items.length - this.limitedItems.length;
        }
    }
});
