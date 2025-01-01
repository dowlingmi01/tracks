login: async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Explicitly request the password field
    const user = await User.scope('withPassword').findOne({ 
      where: { email },
      attributes: {
        include: ['password'] // Explicitly include password
      },
      include: [{
        model: User.sequelize.models.Company,
        as: 'company'
      }]
    });

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Found user:', {
      id: user.id,
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
      passwordValue: user.password // Temporarily log this for debugging
    });

    // Validate password
    console.log('Attempting password validation...', {
      providedPassword: password,
      storedPasswordExists: !!user.password
    });
    
    const isValidPassword = await user.validatePassword(password);
    console.log('Password validation result:', isValidPassword);
    // Generate token with role
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId, // Fixed capitalization
        company: user.company // Include company details if needed
      }
    });
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      stack: error.stack 
    });
    res.status(500).json({ message: 'Error logging in' });  
  }
}