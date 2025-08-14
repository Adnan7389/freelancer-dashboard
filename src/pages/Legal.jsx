import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  Grid
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  FiLock, 
  FiShield, 
  FiDollarSign, 
  FiUser, 
  FiMail, 
  FiFileText,
  FiArrowUp,
  FiChevronRight
} from 'react-icons/fi';

const Legal = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Section data for cleaner code
  const sections = [
    { id: 'privacy-policy', icon: <FiLock />, title: 'Privacy Policy' },
    { id: 'terms-of-service', icon: <FiFileText />, title: 'Terms of Service' }
  ];

  const privacyPolicyContent = {
    introduction: "This Privacy Policy describes how your personal information is collected, used, and shared when you use our Freelancer Dashboard application (\"the App\").",
    sections: [
      {
        title: "Information We Collect",
        icon: <FiUser />,
        items: [
          "Account information (name, email, password)",
          "Profile information (photo, bio, skills)",
          "Project and income data you enter",
          "Payment and billing information (processed securely)",
          "Usage data and analytics"
        ]
      },
      {
        title: "How We Use Your Information",
        icon: <FiShield />,
        items: [
          "Provide, maintain, and improve our services",
          "Process transactions and send related information",
          "Send you technical notices and support messages",
          "Respond to your comments and requests",
          "Monitor and analyze usage and trends",
          "Detect and prevent security issues"
        ]
      },
      {
        title: "Data Security",
        icon: <FiShield />,
        content: "We implement appropriate security measures including encryption, access controls, and regular security audits to protect your personal information. However, no method of transmission over the Internet is 100% secure."
      },
      {
        title: "Your Rights",
        icon: <FiUser />,
        content: "Under GDPR and other privacy laws, you have certain rights regarding your personal data:",
        items: [
          "Right to access, update, or delete your information",
          "Right to object to our processing of your data",
          "Right to request restrictions on processing",
          "Right to data portability",
          "Right to withdraw consent"
        ],
        contact: {
          text: "To exercise these rights, please contact our Data Protection Officer at:",
          email: "privacy@freelancerdashboard.com"
        }
      }
    ]
  };

  const termsOfServiceContent = {
    introduction: "By accessing or using the Freelancer Dashboard application, you agree to be bound by these Terms of Service.",
    sections: [
      {
        title: "Account Terms",
        icon: <FiUser />,
        items: [
          "You must be at least 18 years old to use our service",
          "You are responsible for maintaining account security",
          "You are responsible for all content under your account",
          "You must not use the service for illegal purposes"
        ]
      },
      {
        title: "Payment and Billing",
        icon: <FiDollarSign />,
        items: [
          "Paid plans require valid payment method",
          "Fees are non-refundable except as required by law",
          "We may change prices with notice",
          "Payments processed securely through PCI-compliant processors"
        ]
      },
      {
        title: "User Content",
        icon: <FiFileText />,
        content: "You retain ownership of your content. By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display the content for the purpose of providing our services."
      },
      {
        title: "Changes to Terms",
        content: "We reserve the right to modify these terms at any time. We will provide notice of any changes by:",
        items: [
          "Updating the 'Last updated' date",
          "Sending email notification to users",
          "Posting notice in the application"
        ]
      }
    ]
  };

  return (
    <Container maxWidth="md" sx={{ 
      py: isMobile ? 3 : 4,
      position: 'relative'
    }}>
      {/* Floating back to top button */}
      <Box sx={{ 
        position: 'fixed',
        bottom: isMobile ? 16 : 24,
        right: isMobile ? 16 : 24,
        zIndex: 1000
      }}>
        <Button
          onClick={scrollToTop}
          variant="contained"
          color="primary"
          sx={{
            minWidth: 'auto',
            width: isMobile ? 40 : 48,
            height: isMobile ? 40 : 48,
            borderRadius: '50%',
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6
            }
          }}
          aria-label="Back to top"
        >
          <FiArrowUp />
        </Button>
      </Box>

      {/* Header Section */}
      <Paper elevation={0} sx={{ 
        p: isMobile ? 3 : 4,
        mb: 4,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white'
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <FiFileText size={isMobile ? 24 : 28} />
          Legal Information
        </Typography>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2
        }}>
          <Chip 
            label={`Last updated: August 11, 2025`}
            size="small"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 500
            }}
          />
        </Box>
        
        <Grid container spacing={2}>
          {sections.map((section) => (
            <Grid item xs={12} sm={6} key={section.id}>
              <Button
                component={RouterLink}
                to={`#${section.id}`}
                fullWidth
                variant="contained"
                startIcon={React.cloneElement(section.icon, { size: 18 })}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  py: 1.5,
                  px: 3,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: 'white'
                  }
                }}
              >
                {section.title}
              </Button>
            </Grid>
          ))}
          <Grid item xs={12} sm={6}>
            <Button
              href="mailto:legal@freelancerdashboard.com"
              fullWidth
              variant="outlined"
              startIcon={<FiMail size={18} />}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                py: 1.5,
                px: 3,
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Contact Legal
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Privacy Policy Section */}
      <Box id="privacy-policy" sx={{ mb: isMobile ? 6 : 8 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 4,
          p: 2,
          backgroundColor: theme.palette.primary.light,
          borderRadius: 2,
          color: theme.palette.primary.contrastText
        }}>
          <FiLock size={24} />
          <Typography variant={isMobile ? "h6" : "h5"} component="h2" sx={{ fontWeight: 700 }}>
            Privacy Policy
          </Typography>
        </Box>
        
        <Typography variant={isMobile ? "body2" : "body1"} paragraph sx={{ mb: 4 }}>
          {privacyPolicyContent.introduction}
        </Typography>

        {privacyPolicyContent.sections.map((section, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Paper elevation={0} sx={{ 
              p: isMobile ? 2 : 3,
              mb: 3,
              borderRadius: 2,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              backgroundColor: theme.palette.background.paper
            }}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2
              }}>
                {section.icon && React.cloneElement(section.icon, { 
                  size: 20,
                  color: theme.palette.primary.main 
                })}
                <Typography variant={isMobile ? "subtitle1" : "h6"} component="h3" sx={{ fontWeight: 600 }}>
                  {section.title}
                </Typography>
              </Box>

              {section.content && (
                <Typography variant={isMobile ? "body2" : "body1"} paragraph>
                  {section.content}
                </Typography>
              )}

              {section.items && (
                <List dense disablePadding>
                  {section.items.map((item, itemIndex) => (
                    <ListItem key={itemIndex} sx={{ 
                      px: 0,
                      py: 0.5,
                      alignItems: 'flex-start'
                    }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        mr: 1,
                        mt: '4px',
                        color: theme.palette.primary.main
                      }}>
                        <FiChevronRight size={14} />
                      </Box>
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{ 
                          variant: isMobile ? "body2" : "body1",
                          sx: { lineHeight: 1.5 }
                        }} 
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {section.contact && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant={isMobile ? "body2" : "body1"} paragraph>
                    {section.contact.text}
                  </Typography>
                  <Button 
                    href={`mailto:${section.contact.email}`}
                    variant="contained"
                    color="primary"
                    startIcon={<FiMail />}
                    sx={{ 
                      mt: 1,
                      textTransform: 'none',
                      borderRadius: 2
                    }}
                  >
                    {section.contact.email}
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>
        ))}
      </Box>

      <Divider sx={{ 
        my: isMobile ? 4 : 6,
        borderColor: theme.palette.divider,
        borderBottomWidth: 2
      }} />

      {/* Terms of Service Section */}
      <Box id="terms-of-service">
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 4,
          p: 2,
          backgroundColor: theme.palette.secondary.light,
          borderRadius: 2,
          color: theme.palette.secondary.contrastText
        }}>
          <FiFileText size={24} />
          <Typography variant={isMobile ? "h6" : "h5"} component="h2" sx={{ fontWeight: 700 }}>
            Terms of Service
          </Typography>
        </Box>
        
        <Typography variant={isMobile ? "body2" : "body1"} paragraph sx={{ mb: 4 }}>
          {termsOfServiceContent.introduction}
        </Typography>

        {termsOfServiceContent.sections.map((section, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Paper elevation={0} sx={{ 
              p: isMobile ? 2 : 3,
              mb: 3,
              borderRadius: 2,
              borderLeft: `4px solid ${theme.palette.secondary.main}`,
              backgroundColor: theme.palette.background.paper
            }}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2
              }}>
                {section.icon && React.cloneElement(section.icon, { 
                  size: 20,
                  color: theme.palette.secondary.main 
                })}
                <Typography variant={isMobile ? "subtitle1" : "h6"} component="h3" sx={{ fontWeight: 600 }}>
                  {section.title}
                </Typography>
              </Box>

              {section.content && (
                <Typography variant={isMobile ? "body2" : "body1"} paragraph>
                  {section.content}
                </Typography>
              )}

              {section.items && (
                <List dense disablePadding>
                  {section.items.map((item, itemIndex) => (
                    <ListItem key={itemIndex} sx={{ 
                      px: 0,
                      py: 0.5,
                      alignItems: 'flex-start'
                    }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        mr: 1,
                        mt: '4px',
                        color: theme.palette.secondary.main
                      }}>
                        <FiChevronRight size={14} />
                      </Box>
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{ 
                          variant: isMobile ? "body2" : "body1",
                          sx: { lineHeight: 1.5 }
                        }} 
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default Legal;