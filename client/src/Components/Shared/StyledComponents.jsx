import { styled } from '@mui/material/styles';
import { Paper, Button, Link, IconButton, TextField, FormControl, Avatar } from '@mui/material';

export const CenteredPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(8),
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: "auto",
  minHeight: "20%",
  textAlign: 'center',
  margin: 'auto',
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
  padding: theme.spacing(3),
  maxWidth: 400,
  margin: 'auto',
  marginTop: theme.spacing(4),
}));

export const SettingsControl = styled(FormControl)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
}));