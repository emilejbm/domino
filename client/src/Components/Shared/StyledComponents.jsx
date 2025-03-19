import { styled } from '@mui/material/styles';
import { Paper, Button, Link, IconButton, TextField, FormControl, Avatar, Box } from '@mui/material';

export const CenteredPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(8),
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: "auto",
  minHeight: "20%",
  maxHeight: "80%",
  textAlign: 'center',
  margin: 'auto',
  overflowY: "auto",
}));

export const StyledButton = styled(Button)(({ theme, variant, sx }) => ({
  width: '80%',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
  '& img': {
    marginRight: theme.spacing(2),
  },
  '&:hover': { backgroundColor: 'rgb(84, 62, 2)' },
  ...sx,
  ...(variant && { variant: variant }),
}));

export const StyledLink = styled(Link)(({ theme }) => ({
  marginTop: theme.spacing(6),
  textDecoration: 'none',
  color: theme.palette.primary.main,
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
}));

export const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  marginBottom: theme.spacing(2),
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  width: 50,
  height: 50,
}));

export const SettingsPaper = styled(Paper)(({ theme }) => ({
  position: "relative",
  overflowY: "auto",
  padding: theme.spacing(3),
  maxWidth: 400,
  margin: 'auto',
  marginTop: theme.spacing(4),
}));

export const SettingsControl = styled(FormControl)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
}));

export const AlertContainer = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  width: '50%',
  maxWidth: 400,
  zIndex: 1000,
  textAlign: 'center',
}));

export const TeamRow = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: '1px solid #ccc',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
}));
  
export const TeamMembers = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
});

export const TeamMember = styled(Box)({
  textAlign: 'center',
  width: '50%',
  padding: '8px',
});