"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// const Promise = require(`bluebird`)
const _require = require(`gatsby/graphql`),
      GraphQLObjectType = _require.GraphQLObjectType,
      GraphQLList = _require.GraphQLList,
      GraphQLBoolean = _require.GraphQLBoolean,
      GraphQLString = _require.GraphQLString,
      GraphQLInt = _require.GraphQLInt,
      GraphQLFloat = _require.GraphQLFloat;

const _require2 = require(`gatsby-plugin-webpconv`),
      queueImageResizing = _require2.queueImageResizing,
      base64 = _require2.base64,
      fixed = _require2.fixed; // const sharp = require(`sharp`)


const fs = require(`fs`);

const fsExtra = require(`fs-extra`);

const imageSize = require(`probe-image-size`);

const path = require(`path`); // const DEFAULT_PNG_COMPRESSION_SPEED = 4


const _require3 = require(`./types`),
      ImageWebpConvFormatType = _require3.ImageWebpConvFormatType;

function toArray(buf) {
  let arr = new Array(buf.length);

  for (let i = 0; i < buf.length; i++) {
    arr[i] = buf[i];
  }

  return arr;
} // const getTracedSVG = async ({ file, image, fieldArgs }) =>
//   traceSVG({
//     file,
//     args: { ...fieldArgs.traceSVG },
//     fileArgs: fieldArgs,
//   })


const fixedNodeType = ({
  type,
  pathPrefix,
  getNodeAndSavePathDependency,
  reporter,
  name,
  cache
}) => {
  const FixedType = new GraphQLObjectType({
    name: name,
    fields: {
      base64: {
        type: GraphQLString
      },
      // tracedSVG: {
      //   type: GraphQLString,
      //   resolve: parent => getTracedSVG(parent),
      // },
      aspectRatio: {
        type: GraphQLFloat
      },
      width: {
        type: GraphQLInt
      },
      height: {
        type: GraphQLInt
      },
      src: {
        type: GraphQLString
      },
      srcSet: {
        type: GraphQLString
      },
      srcWebp: {
        type: GraphQLString,
        resolve: function () {
          var _resolve = (0, _asyncToGenerator2.default)(function* ({
            file,
            image,
            fieldArgs
          }) {
            // If the file is already in webp format or should explicitly
            // be converted to webp, we do not create additional webp files
            if (file.extension === `webp` || fieldArgs.toFormat === `webp`) {
              return null;
            }

            const args = Object.assign({}, fieldArgs, {
              pathPrefix,
              toFormat: `webp`
            });
            const fixedImage = yield fixed({
              file,
              args,
              reporter,
              cache
            });
            return fixedImage.src;
          });

          function resolve(_x) {
            return _resolve.apply(this, arguments);
          }

          return resolve;
        }()
      },
      srcSetWebp: {
        type: GraphQLString,
        resolve: function () {
          var _resolve2 = (0, _asyncToGenerator2.default)(function* ({
            file,
            image,
            fieldArgs
          }) {
            if (file.extension === `webp` || fieldArgs.toFormat === `webp`) {
              return null;
            }

            const args = Object.assign({}, fieldArgs, {
              pathPrefix,
              toFormat: `webp`
            });
            const fixedImage = yield fixed({
              file,
              args,
              reporter,
              cache
            });
            return fixedImage.srcSet;
          });

          function resolve(_x2) {
            return _resolve2.apply(this, arguments);
          }

          return resolve;
        }()
      },
      originalName: {
        type: GraphQLString
      }
    }
  });
  return {
    // Deferring the type at least get's me to the "InputType" Error...
    type: () => FixedType,
    args: {
      width: {
        type: GraphQLInt
      },
      height: {
        type: GraphQLInt
      },
      base64Width: {
        type: GraphQLInt
      },
      // jpegProgressive: {
      //   type: GraphQLBoolean,
      //   defaultValue: true,
      // },
      // pngCompressionSpeed: {
      //   type: GraphQLInt,
      //   defaultValue: DEFAULT_PNG_COMPRESSION_SPEED,
      // },
      // grayscale: {
      //   type: GraphQLBoolean,
      //   defaultValue: false,
      // },
      // duotone: {
      //   type: DuotoneGradientType,
      //   defaultValue: false,
      // },
      // traceSVG: {
      //   type: PotraceType,
      //   defaultValue: false,
      // },
      quality: {
        type: GraphQLInt
      },
      toFormat: {
        type: () => ImageWebpConvFormatType,
        defaultValue: ``
      },
      toFormatBase64: {
        type: () => ImageWebpConvFormatType,
        defaultValue: ``
      } // cropFocus: {
      //   type: ImageCropFocusType,
      //   defaultValue: sharp.strategy.attention,
      // },
      // rotate: {
      //   type: GraphQLInt,
      //   defaultValue: 0,
      // },

    },
    resolve: function () {
      var _resolve3 = (0, _asyncToGenerator2.default)(function* (image, fieldArgs, context) {
        const file = getNodeAndSavePathDependency(image.parent, context.path);
        const args = Object.assign({}, fieldArgs, {
          pathPrefix
        });
        const fixedImage = yield fixed({
          file,
          args,
          reporter,
          cache
        });
        return Object.assign({}, fixedImage, {
          fieldArgs: args,
          image,
          file
        });
      });

      function resolve(_x3, _x4, _x5) {
        return _resolve3.apply(this, arguments);
      }

      return resolve;
    }()
  };
}; // const fluidNodeType = ({
//                          type,
//                          pathPrefix,
//                          getNodeAndSavePathDependency,
//                          reporter,
//                          name,
//                          cache,
//                        }) => {
//   return {
//     type: new GraphQLObjectType({
//       name: name,
//       fields: {
//         base64: { type: GraphQLString },
//         tracedSVG: {
//           type: GraphQLString,
//           resolve: parent => getTracedSVG(parent),
//         },
//         aspectRatio: { type: GraphQLFloat },
//         src: { type: GraphQLString },
//         srcSet: { type: GraphQLString },
//         srcWebp: {
//           type: GraphQLString,
//           resolve: ({ file, image, fieldArgs }) => {
//             if (image.extension === `webp` || fieldArgs.toFormat === `webp`) {
//               return null
//             }
//             const args = { ...fieldArgs, pathPrefix, toFormat: `webp` }
//             return Promise.resolve(
//               fluid({
//                 file,
//                 args,
//                 reporter,
//                 cache,
//               })
//             ).then(({ src }) => src)
//           },
//         },
//         srcSetWebp: {
//           type: GraphQLString,
//           resolve: ({ file, image, fieldArgs }) => {
//             if (image.extension === `webp` || fieldArgs.toFormat === `webp`) {
//               return null
//             }
//             const args = { ...fieldArgs, pathPrefix, toFormat: `webp` }
//             return Promise.resolve(
//               fluid({
//                 file,
//                 args,
//                 reporter,
//                 cache,
//               })
//             ).then(({ srcSet }) => srcSet)
//           },
//         },
//         sizes: { type: GraphQLString },
//         originalImg: { type: GraphQLString },
//         originalName: { type: GraphQLString },
//         presentationWidth: { type: GraphQLInt },
//         presentationHeight: { type: GraphQLInt },
//       },
//     }),
//     args: {
//       maxWidth: {
//         type: GraphQLInt,
//       },
//       maxHeight: {
//         type: GraphQLInt,
//       },
//       base64Width: {
//         type: GraphQLInt,
//       },
//       grayscale: {
//         type: GraphQLBoolean,
//         defaultValue: false,
//       },
//       jpegProgressive: {
//         type: GraphQLBoolean,
//         defaultValue: true,
//       },
//       pngCompressionSpeed: {
//         type: GraphQLInt,
//         defaultValue: DEFAULT_PNG_COMPRESSION_SPEED,
//       },
//       duotone: {
//         type: DuotoneGradientType,
//         defaultValue: false,
//       },
//       traceSVG: {
//         type: PotraceType,
//         defaultValue: false,
//       },
//       quality: {
//         type: GraphQLInt,
//       },
//       toFormat: {
//         type: ImageWebpConvFormatType,
//         defaultValue: ``,
//       },
//       toFormatBase64: {
//         type: ImageWebpConvFormatType,
//         defaultValue: ``,
//       },
//       cropFocus: {
//         type: ImageCropFocusType,
//         defaultValue: sharp.strategy.attention,
//       },
//       fit: {
//         type: ImageFitType,
//         defaultValue: sharp.fit.cover,
//       },
//       background: {
//         type: GraphQLString,
//         defaultValue: `rgba(0,0,0,1)`,
//       },
//       rotate: {
//         type: GraphQLInt,
//         defaultValue: 0,
//       },
//       sizes: {
//         type: GraphQLString,
//         defaultValue: ``,
//       },
//       srcSetBreakpoints: {
//         type: GraphQLList(GraphQLInt),
//         defaultValue: [],
//         description: `A list of image widths to be generated. Example: [ 200, 340, 520, 890 ]`,
//       },
//     },
//     resolve: (image, fieldArgs, context) => {
//       const file = getNodeAndSavePathDependency(image.parent, context.path)
//       const args = { ...fieldArgs, pathPrefix }
//       return Promise.resolve(
//         fluid({
//           file,
//           args,
//           reporter,
//           cache,
//         })
//       ).then(o =>
//         Object.assign({}, o, {
//           fieldArgs: args,
//           image,
//           file,
//         })
//       )
//     },
//   }
// }


module.exports = ({
  type,
  pathPrefix,
  getNodeAndSavePathDependency,
  reporter,
  cache
}) => {
  if (type.name !== `ImageWebpConv`) {
    return {};
  }

  const nodeOptions = {
    type,
    pathPrefix,
    getNodeAndSavePathDependency,
    reporter,
    cache
  };
  const fixedNode = fixedNodeType(Object.assign({
    name: `ImageWebpConvFixed`
  }, nodeOptions)); // const fluidNode = fluidNodeType({ name: `ImageWebpConvFluid`, ...nodeOptions })

  const ImageWebpConvOriginal = new GraphQLObjectType({
    name: `ImageWebpConvOriginal`,
    fields: {
      width: {
        type: GraphQLInt
      },
      height: {
        type: GraphQLInt
      },
      src: {
        type: GraphQLString
      }
    }
  });
  const ImageWebpConvResize = new GraphQLObjectType({
    name: `ImageWebpConvResize`,
    fields: {
      src: {
        type: GraphQLString
      },
      // tracedSVG: {
      //   type: GraphQLString,
      //   resolve: parent => getTracedSVG(parent),
      // },
      width: {
        type: GraphQLInt
      },
      height: {
        type: GraphQLInt
      },
      aspectRatio: {
        type: GraphQLFloat
      },
      originalName: {
        type: GraphQLString
      }
    }
  });
  return {
    fixed: () => fixedNode,
    // fluid: fluidNode,
    original: {
      type: () => ImageWebpConvOriginal,
      args: {},
      resolve: function () {
        var _resolve4 = (0, _asyncToGenerator2.default)(function* (image, fieldArgs, context) {
          const details = getNodeAndSavePathDependency(image.parent, context.path);
          const dimensions = imageSize.sync(toArray(fs.readFileSync(details.absolutePath)));
          const imageName = `${details.name}-${image.internal.contentDigest}${details.ext}`;
          const publicPath = path.join(process.cwd(), `public`, `static`, imageName);

          if (!fsExtra.existsSync(publicPath)) {
            fsExtra.copy(details.absolutePath, publicPath, err => {
              if (err) {
                console.error(`error copying file from ${details.absolutePath} to ${publicPath}`, err);
              }
            });
          }

          return {
            width: dimensions.width,
            height: dimensions.height,
            src: `${pathPrefix}/static/${imageName}`
          };
        });

        function resolve(_x6, _x7, _x8) {
          return _resolve4.apply(this, arguments);
        }

        return resolve;
      }()
    },
    resize: {
      type: () => ImageWebpConvResize,
      args: {
        width: {
          type: GraphQLInt
        },
        height: {
          type: GraphQLInt
        },
        quality: {
          type: GraphQLInt
        },
        // jpegProgressive: {
        //   type: GraphQLBoolean,
        //   defaultValue: true,
        // },
        // pngCompressionLevel: {
        //   type: GraphQLInt,
        //   defaultValue: 9,
        // },
        // pngCompressionSpeed: {
        //   type: GraphQLInt,
        //   defaultValue: DEFAULT_PNG_COMPRESSION_SPEED,
        // },
        // grayscale: {
        //   type: GraphQLBoolean,
        //   defaultValue: false,
        // },
        // duotone: {
        //   type: DuotoneGradientType,
        //   defaultValue: false,
        // },
        base64: {
          type: GraphQLBoolean,
          defaultValue: false
        },
        // traceSVG: {
        //   type: PotraceType,
        //   defaultValue: false,
        // },
        toFormat: {
          type: ImageWebpConvFormatType,
          defaultValue: ``
        } // cropFocus: {
        //   type: ImageCropFocusType,
        //   defaultValue: sharp.strategy.attention,
        // },
        // rotate: {
        //   type: GraphQLInt,
        //   defaultValue: 0,
        // },

      },
      resolve: function () {
        var _resolve5 = (0, _asyncToGenerator2.default)(function* (image, fieldArgs, context) {
          const file = getNodeAndSavePathDependency(image.parent, context.path);
          const args = Object.assign({}, fieldArgs, {
            pathPrefix
          });

          if (fieldArgs.base64) {
            return yield base64({
              file,
              cache
            });
          } else {
            const o = queueImageResizing({
              file,
              args
            });
            return Object.assign({}, o, {
              image,
              file,
              fieldArgs: args
            });
          }
        });

        function resolve(_x9, _x10, _x11) {
          return _resolve5.apply(this, arguments);
        }

        return resolve;
      }()
    }
  };
};