import template from './sw-product-clone-modal.html.twig';
import './sw-product-clone-modal.scss';

const { Component } = Shopware;
const { Criteria } = Shopware.Data;

Component.register('sw-product-clone-modal', {
    template,

    inject: ['repositoryFactory', 'numberRangeService'],

    props: {
        product: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            cloningVariants: false,
            cloneMaxProgress: 0,
            cloneProgress: 0
        };
    },

    computed: {
        progressInPercentage() {
            return 100 / this.cloneMaxProgress * this.cloneProgress;
        },

        repository() {
            return this.repositoryFactory.create('product');
        }
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            this.duplicate();
        },

        duplicate() {
            this.numberRangeService
                .reserve('product')
                .then(this.cloneParent)
                .then(this.verifyVariants);
        },

        cloneParent(number) {
            const behavior = {
                cloneChildren: false,
                overwrites: {
                    productNumber: number.number,
                    name: `${this.product.name} ${this.$tc('sw-product.general.copy')}`,
                    productReviews: null,
                    active: false
                }
            };

            return this.repository
                .clone(this.product.id, Shopware.Context.api, behavior)
                .then((clone) => {
                    return { id: clone.id, productNumber: number.number };
                });
        },

        verifyVariants(duplicate) {
            this.getChildrenIds().then((ids) => {
                if (ids.length <= 0) {
                    this.$emit('clone-finish', { id: duplicate.id });
                    return;
                }

                this.cloningVariants = true;

                this.cloneProgress = 1;
                this.cloneMaxProgress = ids.length;

                this.duplicateVariant(duplicate, ids, () => {
                    this.cloningVariants = false;
                    this.$emit('clone-finish', { id: duplicate.id });
                });
            });
        },

        getChildrenIds() {
            const criteria = new Criteria(1, null);
            criteria.addFilter(
                Criteria.equals('parentId', this.product.id)
            );

            return this.repository
                .searchIds(criteria, Shopware.Context.api)
                .then((response) => {
                    return response.data;
                });
        },

        duplicateVariant(duplicate, ids, callback) {
            if (ids.length <= 0) {
                callback();
                return;
            }
            const id = ids.shift();

            const behavior = {
                overwrites: {
                    parentId: duplicate.id,
                    productNumber: `${duplicate.productNumber}.${this.cloneProgress}`,
                    productReviews: null
                },
                cloneChildren: false
            };

            this.repository
                .clone(id, Shopware.Context.api, behavior)
                .then(() => {
                    this.cloneProgress += 1;
                    this.duplicateVariant(duplicate, ids, callback);
                });
        }
    }
});