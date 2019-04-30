/* eslint-disable */
import { graphql } from 'gatsby'

export const gatsbyImageWebpConvFixed = graphql`
  fragment GatsbyImageWebpConvFixed on ImageWebpConvFixed {
    base64
    width
    height
    src
    srcSet
  }
`

// export const gatsbyImageWebpConvFixedTracedSVG = graphql`
//   fragment GatsbyImageWebpConvFixed_tracedSVG on ImageWebpConvFixed {
//     tracedSVG
//     width
//     height
//     src
//     srcSet
//   }
// `
//

export const gatsbyImageWebpConvFixedPreferWebp = graphql`
  fragment GatsbyImageWebpConvFixed_withWebp on ImageWebpConvFixed {
    base64
    width
    height
    src
    srcSet
    srcWebp
    srcSetWebp
  }
`
//
// export const gatsbyImageWebpConvFixedPreferWebpTracedSVG = graphql`
//   fragment GatsbyImageWebpConvFixed_withWebp_tracedSVG on ImageWebpConvFixed {
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
// export const gatsbyImageWebpConvFixedNoBase64 = graphql`
//   fragment GatsbyImageWebpConvFixed_noBase64 on ImageWebpConvFixed {
//     width
//     height
//     src
//     srcSet
//   }
// `
//
// export const gatsbyImageWebpConvFixedPreferWebpNoBase64 = graphql`
//   fragment GatsbyImageWebpConvFixed_withWebp_noBase64 on ImageWebpConvFixed {
//     width
//     height
//     src
//     srcSet
//     srcWebp
//     srcSetWebp
//   }
// `
//
// export const gatsbyImageWebpConvFluid = graphql`
//   fragment GatsbyImageWebpConvFluid on ImageWebpConvFluid {
//     base64
//     aspectRatio
//     src
//     srcSet
//     sizes
//   }
// `
//
// export const gatsbyImageWebpConvFluidTracedSVG = graphql`
//   fragment GatsbyImageWebpConvFluid_tracedSVG on ImageWebpConvFluid {
//     tracedSVG
//     aspectRatio
//     src
//     srcSet
//     sizes
//   }
// `
//
// export const gatsbyImageWebpConvFluidPreferWebp = graphql`
//   fragment GatsbyImageWebpConvFluid_withWebp on ImageWebpConvFluid {
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
// export const gatsbyImageWebpConvFluidPreferWebpTracedSVG = graphql`
//   fragment GatsbyImageWebpConvFluid_withWebp_tracedSVG on ImageWebpConvFluid {
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
// export const gatsbyImageWebpConvFluidNoBase64 = graphql`
//   fragment GatsbyImageWebpConvFluid_noBase64 on ImageWebpConvFluid {
//     aspectRatio
//     src
//     srcSet
//     sizes
//   }
// `
//
// export const gatsbyImageWebpConvFluidPreferWebpNoBase64 = graphql`
//   fragment GatsbyImageWebpConvFluid_withWebp_noBase64 on ImageWebpConvFluid {
//     aspectRatio
//     src
//     srcSet
//     srcWebp
//     srcSetWebp
//     sizes
//   }
// `
