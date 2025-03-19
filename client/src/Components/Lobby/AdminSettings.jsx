import { useState } from 'react';
import {
  Typography,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Stack,
} from '@mui/material';
import { SettingsPaper, SettingsControl } from "../Shared/StyledComponents";


const SettingsList = ({ isAdmin, settings, onSettingChange }) => {
  if (!isAdmin) {
    return null;
  }

  return (
    <SettingsPaper elevation={3}>
      <Typography variant="h6" gutterBottom>
        Lobby Settings
      </Typography>

      <Stack spacing={2}>
        <SettingsControl>
          <InputLabel id="show-moves-label">Show Game Moves</InputLabel>
          <Select
            labelId="show-moves-label"
            id="show-moves-select"
            value={settings.showMoves}
            label="Show Game Moves"
            onChange={(e) => onSettingChange('showMoves', e.target.value)}
          >
            <MenuItem value="On">On</MenuItem>
            <MenuItem value="Off">Off</MenuItem>
          </Select>
        </SettingsControl>

        <SettingsControl>
          <InputLabel id="timer-label">Timer</InputLabel>
          <Select
            labelId="timer-label"
            id="timer-select"
            value={settings.timer}
            label="Timer"
            onChange={(e) => onSettingChange('timer', e.target.value)}
          >
            <MenuItem value="15s">15 seconds</MenuItem>
            <MenuItem value="30s">30 seconds</MenuItem>
            <MenuItem value="60s">60 seconds</MenuItem>
          </Select>
        </SettingsControl>

      </Stack>
    </SettingsPaper>
  );
};

function AdminSettings({ isAdmin }) {
  const [settings, setSettings] = useState({
    showMoves: 'On',
    timer: '30s',
  });

  const handleSettingChange = (settingName, newValue) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [settingName]: newValue,
    }));
  };

  return (
    <Box>
      <SettingsList
        isAdmin={isAdmin}
        settings={settings}
        onSettingChange={handleSettingChange}
      />
    </Box>
  );
}

export default AdminSettings;