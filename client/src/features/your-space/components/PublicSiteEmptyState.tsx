import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type Props = {
  tenantName: string
}

export function PublicSiteEmptyState({ tenantName }: Props) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        textAlign: 'center',
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          mb: 3,
          fontSize: '2rem'
        }}
      >
        <i className='ri-global-line' />
      </Box>
      <Typography variant='h4' sx={{ fontWeight: 800, mb: 1.5 }}>
        {tenantName}
      </Typography>
      <Typography color='text.secondary' sx={{ maxWidth: 420, lineHeight: 1.7 }}>
        This website is being built. Check back soon for updates.
      </Typography>
    </Box>
  )
}
