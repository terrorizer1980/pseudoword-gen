/**
 * Pseudoword Generator
 * @param { string | string[] } seed - reference for building dictionary
 * @param { integer } order          - markov order
 * @param { string } charset         - allowed characters to build words from
 */
class Pseudoword {

    constructor(seed, order, charset) {

        this.charset = typeof charset !== 'string' ? 'abcdefghijklmnopqrstuvwxyz ' : charset
        this.order = isNaN(order) ? 2 : order

        try {
            const regex = new RegExp(`[^${charset}]`, 'g')
            console.log('Generating dictionary...')
            this.dictionary = Array.from((Array.isArray(seed) ? seed : [seed]).reduce((acc, cur) =>
                new Set([...acc, ...cur.toLowerCase().replace(regex, '').split(' ')]), new Set()))
        } catch (e) {
            console.log(e)
            throw new Error('"Seed" parameter is not a string or array of strings')
        }
        
        console.log('Generating transition matrix...')
        this.transitionMatrix = this.createTransitionMatrix()
    }

    createTransitionMatrix() {
        const tMatrix = {}
        for (let i = 0; i < this.dictionary.length; i++) {

            const chars = this.dictionary[i].split('')

            for (let o = this.order; o > 0; o--) {
            
                // p = pointer
                for (let p = 0; p <= chars.length; p++) {

                    let tail = p - o
                    if (tail < 0) tail = 0

                    let nextKey = ''
                    if (p < chars.length) nextKey = chars[p]
                    else nextKey = '$'

                    let sample = ''
                    if (p < 1) sample = '$'
                    else if (p < chars.length) sample = this.dictionary[i].substr(tail, p - tail)
                    else sample = this.dictionary[i].substr(tail)

                    if (!tMatrix.hasOwnProperty(sample)) tMatrix[sample] = this.createBlankTransition()

                    tMatrix[sample]['transition'][nextKey]++
                    tMatrix[sample]['total']++

                }

            }

        }
        return tMatrix;
    }

    createBlankTransition() {
        const transition = {}, keys = [...this.charset.split(''), '$']
        for (var i = 0; i < keys.length; i++) transition[keys[i]] = 0
        return { transition, total: 0 }
    }

    getWord(minLength, maxLength) {
        
        if (!Number.isInteger(maxLength)) maxLength = 16

        let word = '', sample = '$', maxIter = 10;

        for (var iter = 0; iter < maxIter; iter++) {

            for (var i = 0; i < maxLength; i++) {

                const nextKey = this.getNextKey(sample)
                console.log(`${i}: ${sample} -> ${nextKey} (${word})`)
                if (nextKey === '$') continue;

                word += nextKey
    
                sample = word.substr(word.length - this.order)

            }

            if (!Number.isInteger(minLength) || word.length >= minLength) return word

        }

        return word
    }

    getNextKey(originalSample) {

        let sample = originalSample

        for (var i = 0; i < originalSample.length; i++) {

            if (!this.transitionMatrix.hasOwnProperty(sample)) {
                sample = sample.substr(1)
                continue
            }

            const transitions = this.transitionMatrix[sample]['transition'], sortedTransitions = [], rangesTransitions = []

            for (var k in transitions)sortedTransitions.push([k, transitions[k]])
            sortedTransitions.sort((a, b) => a[1] - b[1])


            let acc = 0;
            for (var i = 0; i < sortedTransitions.length; i++) {
                rangesTransitions[i] = sortedTransitions[i]
                acc += sortedTransitions[i][1]
                rangesTransitions[i][1] = acc
            }

            const rand = Math.random() * this.transitionMatrix[sample]['total']

            for (var i = 0; i < rangesTransitions.length; i++) {
                if (rand <= rangesTransitions[i][1]) return rangesTransitions[i][0]
            } 

        }

        return '$'
    }

}

module.exports = Pseudoword