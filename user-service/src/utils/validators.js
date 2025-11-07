import Joi from "joi";

const validateRegistartion = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().required(),
    password: Joi.string().min(6).max(60).required(),
  });

  return schema.validate(data);
};

export { validateRegistartion };
