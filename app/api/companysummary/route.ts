// app/api/companysummary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from 'ai';

// This function can run for a maximum of 60 seconds
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { subpages, mainpage } = await req.json();
    if (!subpages || !mainpage) {
      return NextResponse.json({ error: 'Mainpage or subpage content is required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: anthropic('claude-3-5-sonnet-20240620'),

      system:"All the output content should be in simple english. Don't use any diffcult words.",

      prompt: 
      `You are an expert at writing important points about a company.

      Here are the content from a company's website so you can understand about the company in detail.

      Here are the subpages (which may include about, pricing, faq, blog from the company's website and more): ${subpages}

      Here is the main website content: ${mainpage}

      Now, an you give me the heading and the para about that. 

      Headings could be: Product, Target Users, Funding, Pricing, Company's Goal, 3 company strengths, 3 company weakness, and more, whichever are relevant. Don't have to include a specfic heading if it doesn't have enough source about it, and you can also make up your own headings whichever seems apt.

      It should be (an emoji with heading) and then text with it.

      All the output content should be in simple english. Don't use any diffcult words.

      Return the output strictly as a JSON array of objects following this schema:
      [
        {
          "heading": "",
          "text": ""
        },
        ...
      ]
        Output the result as valid JSON, strictly adhering to the defined schema. Ensure there are no markdown codes or additional elements included in the output. Do not add anything else. Return only JSON.
      `,
    });

    return NextResponse.json({ result: JSON.parse(text) });
  } catch (error) {
    return NextResponse.json({ error: `Company summary API Failed | ${error}` }, { status: 500 });
  }
}
