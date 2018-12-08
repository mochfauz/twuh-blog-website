import Vuex from "vuex"

const LANGS = ["en", "es"]

const importsByLang = { en: { work: {}, blog: {} }, es: { work: {}, blog: {} } }

const importAll = (resolve, lang, type) => {
  resolve.keys().forEach((key) => {
    const [_, name] = key.match(/\/(.+)\.md$/)
    importsByLang[lang][type][name] = resolve(key)
  });
};
importAll(require.context("~/contents/en/work", true, /\.md$/), "en", "work")
importAll(require.context("~/contents/en/blog", true, /\.md$/), "en", "blog")
importAll(require.context("~/contents/es/blog", true, /\.md$/), "es", "blog")
importAll(require.context("~/contents/es/work", true, /\.md$/), "es", "work")

const createStore = () => {
  return new Vuex.Store({
    strict: false,
    state: {
      en: [],
      es: []
    },
    actions: {
      initializeWorksFromAttributes ({ commit }) {
        LANGS.forEach((lang) => {
          const works = Object.keys(importsByLang[lang].work).map((key) => {
            const frontmatter = importsByLang[lang].work[key]
            const attr = frontmatter.attributes
            return {
              name: key,
              title: attr.title,
              year: attr.year,
              owner: attr.owner,
              colors: attr.colors,
              role: attr.role,
              cardAlt: attr.cardAlt,
              description: attr.description,
              related: attr.related,
              renderFunc: frontmatter.vue.render,
              staticRenderFuncs: frontmatter.vue.staticRenderFns,
              image: {
                main: attr.image && attr.image.main,
                og: attr.image && attr.image.og
              }
            }
          }).reduce((obj, item) => {
            obj[item.name] = item
            return obj
          }, {});
          const blogs = Object.keys(importsByLang[lang].blog).map((key) => {
            const frontmatter = importsByLang[lang].blog[key]
            const attr = frontmatter.attributes
            return {
              name: key,
              title: attr.title,
              year: attr.year,
              owner: attr.owner,
              colors: attr.colors,
              role: attr.role,
              trans: attr.trans,
              id: attr.id,
              cardAlt: attr.cardAlt,
              description: attr.description,
              related: attr.related,
              renderFunc: frontmatter.vue.render,
              staticRenderFuncs: frontmatter.vue.staticRenderFns,
              image: {
                main: attr.image && attr.image.main,
                og: attr.image && attr.image.og
              }
            }
          }).reduce((obj, item) => {
            obj[item.name] = item
            return obj
          }, {});
          commit('initialize', {
            works, blogs, lang
          })
        });
      },
      async nuxtServerInit({ dispatch }) {
        dispatch("initializeWorksFromAttributes")
      }
    },
    mutations: {
      initialize (state, payload) {
        state[payload.lang] = payload
      }
    }
  });
};
export default createStore
