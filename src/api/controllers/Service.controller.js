const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Service = require("../models/Service.model");
const User = require("../models/User.model");
const Neighborhood = require("../models/Neighborhood.model");
const Message = require("../models/Message.model");
const Rating = require("../models/Rating.model");

const createServices = async (req, res, next) => {
  let catchImgs = [];
  if (req.files.length > 0) {
    catchImgs = req?.files?.map((file) => file.path);
  } else {
    catchImgs = [
      "https://res.cloudinary.com/dqiveomlb/image/upload/v1709294539/APP/cambio_dr9mqv.png",
    ];
  }

  try {
    await Service.syncIndexes();

    // const ServiceExist = await Service.findOne({ title: req.body.title });
    // if (!ServiceExist) {
    const newService = new Service({
      ...req.body,
      city: req.user.city[0],
      neighborhoods: req.user.neighborhoods[0],
      provider: req.user._id,
      images: catchImgs,
    });

    try {
      const ServiceSave = await newService.save();

      if (ServiceSave.type == "offered") {
        try {
          await User.findByIdAndUpdate(req.user._id, {
            $push: { servicesOffered: ServiceSave._id },
          });
          return res.status(200).json({
            service: ServiceSave,
          });
        } catch (error) {
          res.status(404).json({
            error: "error update service in user",
            message: error.message,
          }) && next(error);
        }
      } else if (ServiceSave.type == "demanded") {
        try {
          await User.findByIdAndUpdate(req.user._id, {
            $push: { servicesDemanded: ServiceSave._id },
          });
          return res.status(200).json({
            service: ServiceSave,
          });
        } catch (error) {
          res.status(404).json({
            error: "error update service in user",
            message: error.message,
          }) && next(error);
        }
      } else {
        return res.status(404).json("service not saved");
      }
    } catch (error) {
      return res.status(404).json(error.message);
    }
    // } else {
    //   catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));

    //   return res.status(409).json("this service already exist");
    // }
  } catch (error) {
    catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

const deleteServices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serviceDelete = await Service.findById(id);
    const serviceDeleteImgs = serviceDelete.images;

    await Service.findByIdAndDelete(id);

    if (await Service.findById(id)) {
      return res.status(404).json("not deleted");
    } else {
      serviceDeleteImgs.forEach((image) => {
        deleteImgCloudinary(image);
      });
      try {
        await User.updateMany(
          { servicesOffered: id },
          { $pull: { servicesOffered: id } }
        );
        try {
          await User.updateMany(
            { servicesDemanded: id },
            { $pull: { servicesDemanded: id } }
          );
          try {
            await Neighborhood.updateMany(
              { services: id },
              { $pull: { services: id } }
            );
            try {
              await Message.deleteMany({ recipientService: id });
              try {
                await Rating.deleteMany({ service: serviceDelete._id });
                return res.status(200).json("rating deleted ok from services");
              } catch (error) {
                return res.status(404).json("rating not deleted");
              }
            } catch (error) {
              return res
                .status(404)
                .json("recipientService not deleted from message");
            }
          } catch (error) {
            return res
              .status(404)
              .json("services not deleted from neighborhood");
          }
        } catch (error) {
          return res.status(404).json("service demanded not deleted from user");
        }
      } catch (error) {
        return res.status(404).json("service offered not deleted from user");
      }
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

const toggleUsersServiceOffered = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { users } = req.body;
    const serviceById = await Service.findById(id);

    if (serviceById) {
      const arrayIdUsers = users.split(",");
      Promise.all(
        arrayIdUsers.map(async (user) => {
          if (serviceById.provider.includes(user)) {
            try {
              await Service.findByIdAndUpdate(id, {
                $pull: { provider: user },
              });

              try {
                await User.findByIdAndUpdate(user, {
                  $pull: { servicesOffered: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update provider offered",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update service offered",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Service.findByIdAndUpdate(id, {
                $push: { provider: user },
              });
              try {
                await User.findByIdAndUpdate(user, {
                  $push: { servicesOffered: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update provider",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update service offered",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Service.findById(id).populate("provider"),
          });
        });
    } else {
      return res.status(404).json("this service doesn't exist");
    }
  } catch (error) {
    return (
      res.status(404).json({
        error: "error catch",
        message: error.message,
      }) && next(error)
    );
  }
};

const toggleUsersServiceDemanded = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { users } = req.body;
    const serviceById = await Service.findById(id);

    if (serviceById) {
      const arrayIdUsers = users.split(",");
      Promise.all(
        arrayIdUsers.map(async (user) => {
          if (serviceById.provider.includes(user)) {
            try {
              await Service.findByIdAndUpdate(id, {
                $pull: { provider: user },
              });

              try {
                await User.findByIdAndUpdate(user, {
                  $pull: { servicesDemanded: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update provider demanded",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update service demanded",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Service.findByIdAndUpdate(id, {
                $push: { provider: user },
              });
              try {
                await User.findByIdAndUpdate(user, {
                  $push: { servicesDemanded: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update provider",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update service demanded",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Service.findById(id).populate("provider"),
          });
        });
    } else {
      return res.status(404).json("this service doesn't exist");
    }
  } catch (error) {
    return (
      res.status(404).json({
        error: "error catch",
        message: error.message,
      }) && next(error)
    );
  }
};

const toggleNeighborhoods = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { neighborhoods } = req.body;
    const serviceById = await Service.findById(id);

    if (serviceById) {
      const arrayIdNeighborhood = neighborhoods.split(",");
      Promise.all(
        arrayIdNeighborhood.map(async (neighborhood) => {
          if (serviceById.neighborhoods.includes(neighborhood)) {
            try {
              await Service.findByIdAndUpdate(id, {
                $pull: { neighborhoods: neighborhood },
              });
              try {
                await Neighborhood.findByIdAndUpdate(neighborhood, {
                  $pull: { services: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update neighborhood",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update service",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Service.findByIdAndUpdate(id, {
                $push: { neighborhoods: neighborhood },
              });
              try {
                await Neighborhood.findByIdAndUpdate(neighborhood, {
                  $push: { services: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update neighborhoods",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update service",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Service.findById(id).populate("neighborhoods"),
          });
        });
    } else {
      return res.status(404).json("this service doesn't exist");
    }
  } catch (error) {
    return (
      res.status(404).json({
        error: "error catch",
        message: error.message,
      }) && next(error)
    );
  }
};

const toggleCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { city } = req.body;
    const serviceById = await Service.findById(id);

    if (serviceById) {
      if (serviceById.city.includes(city)) {
        try {
          await Service.findByIdAndUpdate(id, {
            $pull: { city: city },
          });
          return res.status(200).json({
            dataUpdate: await Service.findById(id).populate("city"),
          });
        } catch (error) {
          res.status(404).json({
            error: "error update service",
            message: error.message,
          }) && next(error);
        }
      } else {
        try {
          await Service.findByIdAndUpdate(id, {
            $push: { city: city },
          });
          return res.status(200).json({
            dataUpdate: await Service.findById(id).populate("city"),
          });
        } catch (error) {
          res.status(404).json({
            error: "error update service",
            message: error.message,
          }) && next(error);
        }
      }
    } else {
      return res.status(404).json("this service doesn't exist");
    }
  } catch (error) {
    return (
      res.status(404).json({
        error: "error catch",
        message: error.message,
      }) && next(error)
    );
  }
};

// const toggleComments = async (req, res, next) => {
// try {
//   const { id } = req.params;
//   const { comments } = req.body;
//   const serviceById = await Service.findById(id);

//   if (serviceById) {
//     const arrayIdComments = comments.split(",");
//     Promise.all(
//       arrayIdComments.map(async (comment) => {
//         if (serviceById.comments.includes(comment)) {
//           try {
//             await Service.findByIdAndUpdate(id, {
//               $pull: { comments: comment },
//             });

//             try {
//               await Message.findByIdAndUpdate(comment, {
//                 $pull: { services: id },
//               });
//             } catch (error) {
//               res.status(404).json({
//                 error: "error update comment",
//                 message: error.message,
//               }) && next(error);
//             }
//           } catch (error) {
//             res.status(404).json({
//               error: "error update service",
//               message: error.message,
//             }) && next(error);
//           }
//         } else {
//           try {
//             await Service.findByIdAndUpdate(id, {
//               $push: { comments: comment },
//             });
//             try {
//               await Message.findByIdAndUpdate(comment, {
//                 $push: { services: id },
//               });
//             } catch (error) {
//               res.status(404).json({
//                 error: "error update comments",
//                 message: error.message,
//               }) && next(error);
//             }
//           } catch (error) {
//             res.status(404).json({
//               error: "error update service",
//               message: error.message,
//             }) && next(error);
//           }
//         }
//       })
//     )
//       .catch((error) => res.status(404).json(error.message))
//       .then(async () => {
//         return res.status(200).json({
//           dataUpdate: await Service.findById(id).populate("comments"),
//         });
//       });
//   } else {
//     return res.status(404).json("this service doesn't exist");
//   }
// } catch (error) {
//   return (
//     res.status(404).json({
//       error: "error catch",
//       message: error.message,
//     }) && next(error)
//   );
// }
// };

//-------------- UPDATE
const updateServices = async (req, res, next) => {
  const { id } = req.params;
  let catchImgs = [];
  if (req.files.length > 0) {
    catchImgs = req?.files?.map((file) => file.path);
  } else {
    catchImgs = [
      "https://res.cloudinary.com/dqiveomlb/image/upload/v1709294539/APP/cambio_dr9mqv.png",
    ];
  }

  try {
    await Service.syncIndexes();

    const patchService = new Service(req.body);

    req.files && (patchService.images = catchImgs);

    try {
      const serviceToUpdate = await Service.findById(id);

      req.files &&
        serviceToUpdate.images.forEach((image) => deleteImgCloudinary(image));
      patchService._id = serviceToUpdate._id;
      await Service.findByIdAndUpdate(id, patchService);

      const updateKeys = Object.keys(req.body);
      const updateService = await Service.findById(id);
      const testUpdate = [];

      updateKeys.forEach((item) => {
        console.log(updateService[item], req.body[item]);
        if (serviceToUpdate[item] !== req.body[item]) {
          testUpdate.push({
            [item]: true,
          });
        } else {
          testUpdate.push({
            [item]: false,
          });
        }
      });

      if (req.files) {
        console.log(updateService.images, catchImgs);
        catchImgs.length > 0
          ? testUpdate.push({
              image: true,
            })
          : testUpdate.push({
              image: false,
            });
      }

      return res.status(200).json({
        updateService,
        testUpdate,
      });
    } catch (error) {
      req.files && catchImgs.forEach((image) => deleteImgCloudinary(image));
      return res.status(404).json(error.message);
    }
  } catch (error) {
    req.files && catchImgs.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

const getByIdService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serviceById = await Service.findById(id)
      .populate([
        {
          path: "comments",
          model: Message,
          populate: "owner",
        },
      ])
      .populate([
        {
          path: "starReview",
          model: Rating,
          populate: "userServiceTaker",
        },
      ])
      .populate("provider neighborhoods");
    if (serviceById) {
      return res.status(200).json(serviceById);
    } else {
      return res.status(404).json("service not found");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

const getAllServices = async (req, res, next) => {
  const { type } = req.params;
  try {
    const allServices = await Service.find({ type }).populate(
      "provider comments neighborhoods"
    );
    if (allServices.length > 0) {
      return res.status(200).json(allServices);
    } else {
      return res.status(404).json("Services not found");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

const getAllServicesStar = async (req, res, next) => {
  try {
    const allServices = await Service.find().populate(
      "starReview provider comments neighborhoods"
    );

    if (allServices.length > 0) {
      const allServicesStar = allServices.map((service) => {
        const stars = service?.starReview?.stars || 0;
        const obj = { ...service };
        obj.stars = stars;
        return obj;
      });

      allServicesStar.sort((a, b) => b.stars - a.stars);
      return res.status(200).json({ services: allServicesStar });
    } else {
      return res.status(404).json("Services not found");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

const getByNameServices = async (req, res, next) => {
  try {
    const { title } = req.params;
    const serviceByName = await Service.find({ title });

    if (serviceByName.length > 0) {
      return res.status(200).json(serviceByName);
    } else {
      return res.status(404).json("not found");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar por nombre capturado en el catch",
      message: error.message,
    });
  }
};

const calculateStarsAverage = async (req, res, next) => {
  const { id } = req.params;

  try {
    const allUserReviews = await Rating.find({ userServiceProvider: id });
    console.log("allUserReviews", allUserReviews);
    const allStars = allUserReviews.map((review) => review.stars);
    console.log("allStars", allStars);
    const totalStars = allStars.reduce((acc, currentStar) => {
      acc += currentStar;
      return acc;
    }, 0);

    const starsAverage = Math.round(totalStars / allStars.length);
    console.log("starsAverage", starsAverage);
    return res.status(200).json({ starsAverage: starsAverage });
  } catch (error) {
    return res
      .status(404)
      .json({ error: error.message, message: "Average stars not caculated" });
  }
};

module.exports = {
  createServices,
  deleteServices,
  toggleUsersServiceOffered,
  toggleUsersServiceDemanded,
  toggleNeighborhoods,
  toggleCity,
  getByIdService,
  getAllServices,
  getByNameServices,
  updateServices,
  calculateStarsAverage,
  getAllServicesStar,
};
