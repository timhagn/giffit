import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'

/**
 * This component is built using `gatsby-background-image` to automatically
 * serve optimized background-images with lazy loading and reduced file sizes
 * as well as a `gatsby-image` for comparison.
 * The image is loaded using a `StaticQuery`, which allows us to load the image
 * from directly within this component, rather than having to pass
 * the image data down from pages.
 *
 * For more information, see the docs:
 * - `gatsby-background-image`: https://github.com/timhagn/gatsby-background-image
 * - `gatsby-image`: https://gatsby.dev/gatsby-image
 * - `StaticQuery`: https://gatsby.dev/staticquery
 */

const Image = () => (
  <StaticQuery
    query={graphql`
      query {
        gifImage: file(relativePath: { eq: "tdmac.gif" }) {
          childImageGifFit {
            fixed(width: 300) {
              ...GatsbyImageGifFitFixed_withWebp
            }
          }
        }
      }
    `}
    render={data => {
      const image = data.gifImage.childImageGifFit
      return <Img fixed={image.fixed} style={{ borderRadius: `15px` }} />
    }}
  />
)
export default Image
