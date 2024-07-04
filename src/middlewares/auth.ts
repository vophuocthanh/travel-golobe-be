export const auth = (req: any, res: any, next: any) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      next();
    }
    const user = req.user;
    req.user = user;
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
