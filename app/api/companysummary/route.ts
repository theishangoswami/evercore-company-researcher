import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from 'ai';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { subpages, mainpage, websiteurl } = await req.json();
    
    if (!subpages || !mainpage) {
      return NextResponse.json({ error: 'Mainpage or subpage content is required' }, { status: 400 });
    }

    // Simply stringify the JSON objects
    const subpagesText = JSON.stringify(subpages, null, 2);
    const mainpageText = JSON.stringify(mainpage, null, 2);

    const { text } = await generateText({
      model: anthropic('claude-3-5-sonnet-20240620'),
      
      system: "All the output content should be in simple english. Don't use any difficult words.",
      
      prompt: `You are an expert at writing important points about a company.

      Here are the content from a company's website so you can understand about the company in detail.

      MAIN WEBSITE CONTENT:
      ${mainpageText}
        
      Now, after understanding about this company whose url is ${websiteurl}, give me headings and the relevant content about it.

      Headings could be: Product, Target Users, Funding, Pricing, Company's Goal, 3 company strengths, 3 company weakness, and more, whichever are relevant. Don't have to include a specific heading if it doesn't have enough source about it, and you can also make up your own headings whichever seems apt.

      Have max 6-7 headings not more than that.

      It should be (an emoji with heading) and then text with it.

      All the output content should be in simple english. Don't use any difficult words.

      Return the output strictly as a JSON array of objects following this schema:
      [
        {
          "heading": "",
          "text": ""
        },
        ...
      ]
      Output the result as valid JSON, strictly adhering to the defined schema. Ensure there are no markdown codes or additional elements included in the output. Do not add anything else. Return only JSON.`,
    });

    return NextResponse.json({ result: JSON.parse(text) });
  } catch (error) {
    console.error('Company summary API error:', error);
    return NextResponse.json({ error: `Company summary API Failed | ${error}` }, { status: 500 });
  }
}