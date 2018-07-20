'use strict';

module.exports = Prompts;

const {
    uniqBy,
    flattenDeep
} = require('lodash');

const {
    BINDING_NS,
    BINDING_DELIM,
    OP_PREFIX
} = require('../constants');

function Prompts(argv, queue) {
    // The time complexity of this function is completely insane. There must be a better way. Indicative of a design flaw and warrants further scrutiny.
    const bindingsTo = flattenDeep(queue).reduce((acc, { name, namespace }) =>
        (namespace === BINDING_NS)
            ? [ ...acc, name.replace(OP_PREFIX, '').split(BINDING_DELIM)[1] ]
            : acc,
        []);
    return uniqBy(flattenDeep(queue)
        .reduce((acc, entry, idx, arr) => {
            if (entry.prompts) {
                // wherein we peer into the future to see what we should do... but at what cost... something is rotten in Denmark.
                const prompts = entry.prompts.filter((prompt) => {
                    const namesSoFar = arr.slice(0, idx).map(({ name }) => name);
                    if (!prompt.optional || namesSoFar.lastIndexOf(`${OP_PREFIX}prompts-on`) > namesSoFar.lastIndexOf(`${OP_PREFIX}prompts-off`)) return true;
                });
                return [ ...acc, ...prompts ];
            }
            return acc;
            },
        []), 'name')
        .filter((p) => !bindingsTo.includes(p.name));
}