import { motion } from 'framer-motion';
import { Box, Grid } from '@mui/material';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import RightAIPanel from './RightAIPanel';
import { DashboardPlaceholder } from './DashboardPlaceholder';

export default function DashboardLayout() {
  return (
    <Box sx={{ background: '#F7F9FF', minHeight: '100vh', pb: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: 1480, mx: 'auto', px: { xs: 2, md: 4, xl: 6 }, pt: { xs: 3, md: 4 } }}>
        <TopNav />

        <Grid container spacing={3}>
          <Grid item xs={12} lg={3}>
            <Sidebar />
          </Grid>

          <Grid item xs={12} lg={6}>
            <Box sx={{ display: 'grid', gap: 20 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <DashboardPlaceholder
                  title="Module 2 – Welcome Section"
                  description="This premium hero section will greet the student dynamically and show semester, streaks, XP level, motivation and quick start actions."
                  accent="#FF6A00"
                  rows={4}
                />
              </motion.div>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <DashboardPlaceholder
                    title="Module 3 – AI Recommendations"
                    description="A premium recommendation card will display career, resume, interview and internship suggestions from SIDDHI."
                    accent="#0B1957"
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DashboardPlaceholder
                    title="Module 4 – Resume Health"
                    description="Circular progress visuals will show ATS, grammar, keyword update status, skills and experience health."
                    accent="#0A9B5C"
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DashboardPlaceholder
                    title="Module 5 – Internship & Job Tracker"
                    description="A modern tracker will show applied jobs, interviews, offers, bookmarks and deadlines with filters."
                    accent="#60B2E5"
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DashboardPlaceholder
                    title="Module 6 – Career Roadmap"
                    description="Timeline, semester progress and milestones will show completed skills, current path and upcoming goals."
                    accent="#F5B800"
                    rows={3}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <DashboardPlaceholder title="Module 7 – Learning Progress" description="Track courses, certificates, coding, aptitude and reasoning with daily and weekly progress. " accent="#0B1957" rows={2} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DashboardPlaceholder title="Module 8 – Analytics" description="Charts and growth visuals for skills, applications, learning hours and XP. " accent="#FF6A00" rows={2} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DashboardPlaceholder title="Module 9 – Notifications" description="Notification center will manage job alerts, interview reminders, achievements and messages from SIDDHI. " accent="#0A9B5C" rows={2} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DashboardPlaceholder title="Module 10 – Quick Actions" description="Premium quick action buttons for resume, interview prep, roadmap, games, certificates and jobs. " accent="#60B2E5" rows={2} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DashboardPlaceholder title="Module 11 – Achievements" description="Show badges, coins, leaderboard, streaks and weekly challenges in animated cards. " accent="#F5B800" rows={2} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DashboardPlaceholder title="Module 12 – Polish" description="The final polish phase will refine spacing, accessibility, animations and responsive transitions. " accent="#1A2E7E" rows={2} />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12} lg={3}>
            <RightAIPanel />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
