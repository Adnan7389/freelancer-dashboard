import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Link, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Paper
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  FiLock, 
  FiShield, 
  FiDollarSign, 
  FiUser, 
  FiMail, 
  FiFileText,
  FiArrowUp
} from 'react-icons/fi';

const Legal = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Legal Information
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Last updated: August 11, 2025
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Button 
            component={RouterLink} 
            to="#privacy-policy" 
            variant="outlined" 
            startIcon={<FiLock />}
            sx={{ textTransform: 'none' }}
          >
            Privacy Policy
          </Button>
          <Button 
            component={RouterLink} 
            to="#terms-of-service" 
            variant="outlined" 
            startIcon={<FiFileText />}
            sx={{ textTransform: 'none' }}
          >
            Terms of Service
          </Button>
          <Button 
            href="mailto:legal@freelancerdashboard.com" 
            variant="outlined" 
            startIcon={<FiMail />}
            sx={{ textTransform: 'none' }}
          >
            Contact Legal
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Box id="privacy-policy" sx={{ mb: 8 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FiLock /> Privacy Policy
        </Typography>
        
        <Typography variant="body1" paragraph>
          This Privacy Policy describes how your personal information is collected, used, and shared when you use our Freelancer Dashboard application ("the App").
        </Typography>

        <Paper elevation={0} sx={{ p: 3, my: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiUser /> Information We Collect
          </Typography>
          <List dense>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Account information (name, email, password)" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Profile information (photo, bio, skills)" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Project and income data you enter" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Payment and billing information (processed securely through our payment processors)" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Usage data and analytics" />
            </ListItem>
          </List>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, my: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiShield /> How We Use Your Information
          </Typography>
          <List dense>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Provide, maintain, and improve our services" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Process transactions and send related information" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Send you technical notices and support messages" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Respond to your comments, questions, and requests" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Monitor and analyze usage and trends" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Detect, investigate, and prevent security issues" />
            </ListItem>
          </List>
        </Paper>

        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mt: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FiShield /> Data Security
        </Typography>
        <Typography variant="body1" paragraph>
          We implement appropriate security measures including encryption, access controls, and regular security audits to protect your personal information. However, no method of transmission over the Internet is 100% secure.
        </Typography>

        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mt: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FiUser /> Your Rights
        </Typography>
        <Typography variant="body1" paragraph>
          Under GDPR and other privacy laws, you have certain rights regarding your personal data:
        </Typography>
        <List dense>
          <ListItem sx={{ px: 0 }}>
            <ListItemText primary="Right to access, update, or delete your information" />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemText primary="Right to object to our processing of your data" />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemText primary="Right to request restrictions on processing" />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemText primary="Right to data portability" />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemText primary="Right to withdraw consent" />
          </ListItem>
        </List>
        <Typography variant="body1" paragraph sx={{ mt: 2 }}>
          To exercise these rights, please contact our Data Protection Officer at:
        </Typography>
        <Button 
          href="mailto:privacy@freelancerdashboard.com" 
          variant="contained" 
          startIcon={<FiMail />}
          sx={{ mt: 1, textTransform: 'none' }}
        >
          privacy@freelancerdashboard.com
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box id="terms-of-service">
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FiFileText /> Terms of Service
        </Typography>
        
        <Typography variant="body1" paragraph>
          By accessing or using the Freelancer Dashboard application, you agree to be bound by these Terms of Service.
        </Typography>

        <Paper elevation={0} sx={{ p: 3, my: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiUser /> Account Terms
          </Typography>
          <List dense>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="You must be at least 18 years old to use our service" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="You are responsible for maintaining the security of your account" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="You are responsible for all content posted and activity that occurs under your account" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="You must not use the service for any illegal or unauthorized purpose" />
            </ListItem>
          </List>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, my: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiDollarSign /> Payment and Billing
          </Typography>
          <List dense>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Paid plans require a valid payment method" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="Fees are non-refundable except as required by law" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="We may change our prices and will provide notice of price changes" />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="All payments are processed securely through our PCI-compliant payment processors" />
            </ListItem>
          </List>
        </Paper>

        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mt: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FiFileText /> User Content
        </Typography>
        <Typography variant="body1" paragraph>
          You retain ownership of your content. By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display the content for the purpose of providing our services.
        </Typography>

        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
          Changes to Terms
        </Typography>
        <Typography variant="body1" paragraph>
          We reserve the right to modify these terms at any time. We will provide notice of any changes by:
        </Typography>
        <List dense>
          <ListItem sx={{ px: 0 }}>
            <ListItemText primary="Updating the 'Last updated' date at the top of this page" />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemText primary="Sending an email notification to registered users" />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemText primary="Posting a notice in the application dashboard" />
          </ListItem>
        </List>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button 
            onClick={scrollToTop}
            variant="outlined" 
            startIcon={<FiArrowUp />}
            sx={{ textTransform: 'none' }}
          >
            Back to Top
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Legal;