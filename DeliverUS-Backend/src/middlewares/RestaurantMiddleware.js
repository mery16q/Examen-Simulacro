import { Restaurant, Order } from '../models/models.js'

const checkRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)
    if (req.user.id === restaurant.userId) {
      return next()
    }
    return res.status(403).send('Not enough privileges. This entity does not belong to you')
  } catch (err) {
    return res.status(500).send(err)
  }
}
const restaurantHasNoOrders = async (req, res, next) => {
  try {
    const numberOfRestaurantOrders = await Order.count({
      where: { restaurantId: req.params.restaurantId }
    })
    if (numberOfRestaurantOrders === 0) {
      return next()
    }
    return res.status(409).send('Some orders belong to this restaurant.')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}
/*
const checkRestaurantNotPromoted = async (req, res, next) => {
  try {
    const restaurantP = await Restaurant.findByPk(req.params.restaurantId)
    if (restaurantP.promoted) {
      const restaurant = await Restaurant.findOne({
        where: {
          userId: req.user.id,
          promoted: true
        }
      })
      if (restaurant === null) {
        return next()
      } else {
        restaurant.promoted = false
        return res.status(422).send('The restaurant doesn`t exists.')
      }
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}
  */

const checkRestaurantNotPromoted = async (req, res, next) => {
  try {
    const { promoted } = req.body

    if (promoted === true) {
      // Check if there's already a promoted restaurant for this user
      const existingPromotedRestaurant = await Restaurant.findOne({
        where: {
          userId: req.user.id,
          promoted: true
        }
      })

      if (existingPromotedRestaurant) {
        // If another restaurant is already promoted, change its status
        await existingPromotedRestaurant.update({ promoted: false })
      }
    }

    // Proceed to the next middleware/controller
    return next()
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export { checkRestaurantOwnership, restaurantHasNoOrders, checkRestaurantNotPromoted }
