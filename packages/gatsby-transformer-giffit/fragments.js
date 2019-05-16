"use strict";

exports.__esModule = true;
exports.gatsbyImageGifFitFixedPreferWebp = exports.gatsbyImageGifFitFixed = void 0;

var _gatsby = require("gatsby");

/* eslint-disable */
const gatsbyImageGifFitFixed = _gatsby.graphql`
  fragment GatsbyImageGifFitFixed on ImageGifFitFixed {
    base64
    width
    height
    src
    srcSet
  }
`; // export const gatsbyImageGifFitFixedTracedSVG = graphql`
//   fragment GatsbyImageGifFitFixed_tracedSVG on ImageGifFitFixed {
//     tracedSVG
//     width
//     height
//     src
//     srcSet
//   }
// `
//

exports.gatsbyImageGifFitFixed = gatsbyImageGifFitFixed;
const gatsbyImageGifFitFixedPreferWebp = _gatsby.graphql`
  fragment GatsbyImageGifFitFixed_withWebp on ImageGifFitFixed {
    base64
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`; //
// export const gatsbyImageGifFitFixedPreferWebpTracedSVG = graphql`
//   fragment GatsbyImageGifFitFixed_withWebp_tracedSVG on ImageGifFitFixed {
//     tracedSVG
//     width
//     height
//     src
//     srcSet
//     srcWebp
//     srcSetWebp
//   }
// `
//
// export const gatsbyImageGifFitFixedNoBase64 = graphql`
//   fragment GatsbyImageGifFitFixed_noBase64 on ImageGifFitFixed {
//     width
//     height
//     src
//     srcSet
//   }
// `
//
// export const gatsbyImageGifFitFixedPreferWebpNoBase64 = graphql`
//   fragment GatsbyImageGifFitFixed_withWebp_noBase64 on ImageGifFitFixed {
//     width
//     height
//     src
//     srcSet
//     srcWebp
//     srcSetWebp
//   }
// `
//
// export const gatsbyImageGifFitFluid = graphql`
//   fragment GatsbyImageGifFitFluid on ImageGifFitFluid {
//     base64
//     aspectRatio
//     src
//     srcSet
//     sizes
//   }
// `
//
// export const gatsbyImageGifFitFluidTracedSVG = graphql`
//   fragment GatsbyImageGifFitFluid_tracedSVG on ImageGifFitFluid {
//     tracedSVG
//     aspectRatio
//     src
//     srcSet
//     sizes
//   }
// `
//
// export const gatsbyImageGifFitFluidPreferWebp = graphql`
//   fragment GatsbyImageGifFitFluid_withWebp on ImageGifFitFluid {
//     base64
//     aspectRatio
//     src
//     srcSet
//     srcWebp
//     srcSetWebp
//     sizes
//   }
// `
//
// export const gatsbyImageGifFitFluidPreferWebpTracedSVG = graphql`
//   fragment GatsbyImageGifFitFluid_withWebp_tracedSVG on ImageGifFitFluid {
//     tracedSVG
//     aspectRatio
//     src
//     srcSet
//     srcWebp
//     srcSetWebp
//     sizes
//   }
// `
//
// export const gatsbyImageGifFitFluidNoBase64 = graphql`
//   fragment GatsbyImageGifFitFluid_noBase64 on ImageGifFitFluid {
//     aspectRatio
//     src
//     srcSet
//     sizes
//   }
// `
//
// export const gatsbyImageGifFitFluidPreferWebpNoBase64 = graphql`
//   fragment GatsbyImageGifFitFluid_withWebp_noBase64 on ImageGifFitFluid {
//     aspectRatio
//     src
//     srcSet
//     srcWebp
//     srcSetWebp
//     sizes
//   }
// `

exports.gatsbyImageGifFitFixedPreferWebp = gatsbyImageGifFitFixedPreferWebp;