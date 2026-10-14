export const defineUser = (req, res, next) => {
  //Заглушка, 1-id пользователя из 001_dev_user.sql. Потом заменится на авторизацию.
  req.userId = 1;
  next();
};
