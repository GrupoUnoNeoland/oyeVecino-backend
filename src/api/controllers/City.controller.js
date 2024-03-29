const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Chat = require("../models/Chat.model");
const City = require("../models/City.model");
const Event = require("../models/Event.model");
const Message = require("../models/Message.model");
const Neighborhood = require("../models/Neighborhood.model");
const Rating = require("../models/Rating.model");
const Request = require("../models/Request.model");
const Service = require("../models/Service.model");
const Statement = require("../models/Statement.model");
const User = require("../models/User.model");
const dotenv = require("dotenv");

dotenv.config();

const createCity = async (req, res, next) => {
  try {
    let catchImgs = req?.files?.map((file) => file.path);
    await City.syncIndexes();

    const CityExist = await City.findOne({ name: req.body.name });
    if (!CityExist) {
      const newCity = new City({ ...req.body, images: catchImgs });

      try {
        const CitySave = await newCity.save();

        if (CitySave) {
          return res.status(200).json({
            city: CitySave,
          });
        } else {
          return res.status(404).json("city not saved");
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      catchImgs.forEach((image) => deleteImgCloudinary(image));

      return res.status(409).json("this city already exists");
    }
  } catch (error) {
    catchImgs.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

const updateCity = async (req, res, next) => {
  let catchImg = req.files.map((file) => file.path);
  const { id } = req.params;

  try {
    await City.syncIndexes();

    const patchCity = new City(req.body);

    req.files && (patchCity.images = catchImg);

    try {
      const cityToUpdate = await City.findById(id);

      req.files &&
        cityToUpdate.images.forEach((image) => deleteImgCloudinary(image));
      patchCity._id = cityToUpdate._id;
      await City.findByIdAndUpdate(id, patchCity);

      const updateKeys = Object.keys(req.body);
      const updateCity = await City.findById(id);
      const testUpdate = [];

      updateKeys.forEach((item) => {
        console.log(updateCity[item], req.body[item]);
        if (cityToUpdate[item] !== req.body[item]) {
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
        console.log(updateCity.images, catchImg);
        catchImg.length > 0
          ? testUpdate.push({
            image: true,
          })
          : testUpdate.push({
            image: false,
          });
      }

      return res.status(200).json({
        updateCity,
        testUpdate,
      });
    } catch (error) {
      req.files && catchImg.forEach((image) => deleteImgCloudinary(image));
      return res.status(404).json(error.message);
    }
  } catch (error) {
    req.files && catchImg.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

const toggleNeighborhoodInCity = async (req, res, next) => {
  try {
    const { id: cityId } = req.params;
    const id = req.body.neighborhood;

    const cityById = await City.findById(cityId);
    const neighborhoodById = await Neighborhood.findById(id);

    if (cityById) {
      if (cityById.neighborhoods.includes(id)) {
        try {
          await City.findByIdAndUpdate(cityId, {
            $pull: { neighborhoods: id },
          });
          try {
            await Neighborhood.findByIdAndUpdate(id, {
              $pull: { city: cityId },
            });
            return res.status(200).json({
              dataUpdate: await Neighborhood.findById(id),
            });
          } catch (error) {
            res.status(404).json({
              error: "error update city in neighborhood",
              message: error.message,
            }) && next(error);
          }
        } catch (error) {
          res.status(404).json({
            error: "error update neighborhood in city",
            message: error.message,
          }) && next(error);
        }
      } else {
        try {
          await City.findByIdAndUpdate(cityId, {
            $push: { neighborhoods: id },
          });
          try {
            await Neighborhood.findByIdAndUpdate(id, {
              $push: { city: cityId },
            });
            return res.status(200).json({
              dataUpdate: await Neighborhood.findById(id).populate("city"),
            });
          } catch (error) {
            res.status(404).json({
              error: "error update city in neighborhood",
              message: error.message,
            }) && next(error);
          }
        } catch (error) {
          res.status(404).json({
            error: "error update neighborhood in city",
            message: error.message,
          }) && next(error);
        }
      }
    } else {
      return res.status(404).json("this city doesn't exist");
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

const toggleUserInCity = async (req, res, next) => {
  try {
    const { id: city } = req.params;
    const { userId: id } = req.body;
    console.log("Userid", id);

    const userById = await User.findById(id);
    console.log("userById", userById);

    if (userById) {
      if (userById.city.includes(city)) {
        try {
          await User.findByIdAndUpdate(id, {
            $pull: { city: city },
          });
          try {
            await City.findByIdAndUpdate(city, {
              $pull: { users: id },
            });
            return res.status(200).json({
              dataUpdate: await City.findById(city).populate(
                "neighborhoods users"
              ),
            });
          } catch (error) {
            res.status(404).json({
              error: "error update user in city",
              message: error.message,
            }) && next(error);
          }
        } catch (error) {
          res.status(404).json({
            error: "error update city in user",
            message: error.message,
          }) && next(error);
        }
      } else {
        try {
          await City.findByIdAndUpdate(city, {
            $push: { users: id },
          });
          try {
            await User.findByIdAndUpdate(id, {
              $push: { city: city },
            });
            return res.status(200).json({
              dataUpdate: await User.findById(id).populate("city"),
            });
          } catch (error) {
            res.status(404).json({
              error: "error update city in user",
              message: error.message,
            }) && next(error);
          }
        } catch (error) {
          res.status(404).json({
            error: "error update user in city",
            message: error.message,
          }) && next(error);
        }
      }
    } else {
      return res.status(404).json("this user do not exist");
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

const deleteCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cityDelete = await City.findById(id);
    const cityImages = cityDelete?.images;

    if (cityDelete) {
      try {
        await City.findByIdAndDelete(id);
        cityImages && cityImages.forEach((image) => deleteImgCloudinary(image));
        try {
          await Neighborhood.deleteMany({ city: id });
          try {
            await User.deleteMany({ city: id });
            try {
              await Service.deleteMany({ city: id });
              try {
                await Statement.deleteMany({ city: id });
                try {
                  await Event.deleteMany({ city: id });
                  try {
                    await Request.deleteMany({ city: id });
                    try {
                      await Message.deleteMany({ city: id });
                      try {
                        await Rating.deleteMany({ city: id });
                        try {
                          await Chat.deleteMany({ city: id });
                          return res.status(200).json("city deleted ok");
                        } catch (error) {
                          return res.status(200).json("all chats deleted");
                        }
                      } catch (error) {
                        return res.status(200).json("all request deleted");
                      }
                    } catch (error) {
                      return res.status(404).json("messages not deleted");
                    }
                  } catch (error) {
                    return res.status(404).json("requests not deleted");
                  }
                } catch (error) {
                  return res.status(404).json("event not deleted");
                }
              } catch (error) {
                return res.status(404).json("statement not deleted");
              }
            } catch (error) {
              return res.status(404).json("service not deleted");
            }
          } catch (error) {
            return res.status(404).json("user not deleted");
          }
        } catch (error) {
          return res.status(404).json("neighborhoods not deleted");
        }
      } catch (error) {
        return res.status(404).json("City not deleted");
      }
    } else {
      return res.status(404).json("City not found");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

const getByIdCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cityById = await City.findById(id).populate("neighborhoods");
    if (cityById) {
      return res.status(200).json({
        dataUpdate: await City.findById(id).populate("neighborhoods users"),
      });
    } else {
      return res.status(404).json("city not found");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

const getAllCity = async (req, res, next) => {
  try {
    const allCities = await City.find().populate("neighborhoods");
    if (allCities.length > 0) {
      return res.status(200).json({
        dataUpdate: await City.find().populate("neighborhoods users"),
      });
    } else {
      return res.status(404).json("Cities not found");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

module.exports = {
  createCity,
  deleteCity,
  getByIdCity,
  getAllCity,
  toggleNeighborhoodInCity,
  toggleUserInCity,
  updateCity,
};
