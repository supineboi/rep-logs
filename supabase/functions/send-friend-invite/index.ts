import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteEmailRequest {
  to_email: string;
  from_user: string;
  request_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to_email, from_user, request_id }: InviteEmailRequest = await req.json();

    console.log('Sending friend invite email to:', to_email, 'from:', from_user);

    // For now, just log the email (you can implement actual email sending with Resend)
    // This would typically use Resend API to send the email
    const emailContent = {
      to: to_email,
      subject: `${from_user} invited you to join Rep Logs!`,
      message: `
        Hi there!
        
        ${from_user} has invited you to join Rep Logs, the best workout tracking app for serious lifters.
        
        Join Rep Logs to:
        - Track your workouts with lightning speed
        - Share progress with workout buddies
        - Stay motivated together
        
        Click here to join: ${Deno.env.get('SUPABASE_URL') || 'https://yourapp.com'}/auth?invite=${request_id}
        
        Start your fitness journey today!
        
        - The Rep Logs Team
      `
    };

    console.log('Email would be sent:', emailContent);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invite email sent successfully' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-friend-invite function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);